package com.skillinfinity.payment.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.payment.dto.request.PaymentConfirmationRequest;
import com.skillinfinity.payment.dto.request.PaymentFailureRequest;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.response.InvoiceResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.ReceiptResponse;
import com.skillinfinity.payment.entity.Coupon;
import com.skillinfinity.payment.entity.Invoice;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.entity.PaymentAttempt;
import com.skillinfinity.payment.entity.PaymentAudit;
import com.skillinfinity.payment.entity.PaymentHistory;
import com.skillinfinity.payment.entity.Receipt;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import com.skillinfinity.payment.exception.PaymentFailedException;
import com.skillinfinity.payment.event.PaymentEventPublisher;
import com.skillinfinity.payment.exception.DuplicateTransactionException;
import com.skillinfinity.payment.exception.PaymentFailedException;
import com.skillinfinity.payment.gateway.GatewayRegistry;
import com.skillinfinity.payment.gateway.PaymentGatewayStrategy;
import com.skillinfinity.payment.mapper.PaymentMapper;
import com.skillinfinity.payment.repository.InvoiceRepository;
import com.skillinfinity.payment.repository.PaymentAttemptRepository;
import com.skillinfinity.payment.repository.PaymentAuditRepository;
import com.skillinfinity.payment.repository.PaymentHistoryRepository;
import com.skillinfinity.payment.repository.PaymentRepository;
import com.skillinfinity.payment.repository.ReceiptRepository;
import com.skillinfinity.payment.service.CouponService;
import com.skillinfinity.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String CURRENCY_CREDITS = "CREDITS";

    private final PaymentRepository paymentRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final InvoiceRepository invoiceRepository;
    private final ReceiptRepository receiptRepository;
    private final PaymentAuditRepository paymentAuditRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher eventPublisher;
    private final GatewayRegistry gatewayRegistry;
    private final CouponService couponService;

    @Override
    @Transactional
    public PaymentResponse initiatePayment(UUID userId, PaymentRequest request) {
        validateDuplicateReference(request.getReferenceId());

        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponService.validateAndApplyCoupon(
                    request.getCouponCode(), request.getAmount(), userId.toString());
            discountAmount = couponService.calculateDiscount(coupon, request.getAmount());
            couponCode = request.getCouponCode();
        }

        BigDecimal totalAmount = request.getAmount().subtract(discountAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        // The number of credits is supplied by the credit-pack purchase request
        // (e.g. 10 credits for ₹109). Fall back to the amount only for legacy
        // callers that did not specify an explicit credit count.
        BigDecimal credits = request.getCredits() != null ? request.getCredits() : totalAmount;

        PaymentGateway gateway;
        try {
            gateway = PaymentGateway.valueOf(request.getGateway().toUpperCase());
        } catch (IllegalArgumentException e) {
            gateway = PaymentGateway.INTERNAL;
        }

        PaymentGatewayStrategy gatewayStrategy = gatewayRegistry.getStrategy(gateway);

        Payment payment = Payment.builder()
                .userId(userId)
                .paymentNumber(generatePaymentNumber())
                .status(PaymentStatus.INITIATED)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : CURRENCY_CREDITS)
                .credits(credits)
                .gateway(gateway)
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        String gatewayOrderId = gatewayStrategy.createOrder(payment);
        payment.setGatewayOrderId(gatewayOrderId);

        payment = paymentRepository.save(payment);

        savePaymentHistory(payment, null, PaymentStatus.INITIATED.name(), "PAYMENT_INITIATED",
                "Payment initiated for " + request.getAmount() + " credits", userId.toString());

        savePaymentAttempt(payment, 1, gateway.name(), gatewayOrderId, request.getDescription());

        auditPayment(payment, userId, "PAYMENT_INITIATED",
                "Payment initiated: " + request.getAmount() + " " + request.getCurrency());

        eventPublisher.publishPaymentInitiated(
                payment.getId(), userId, payment.getPaymentNumber(),
                request.getAmount(), request.getCurrency(), gateway.name(),
                request.getDescription());

        log.info("Payment initiated: paymentId={}, userId={}, amount={}, gateway={}",
                payment.getId(), userId, request.getAmount(), gateway);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(UUID userId, PaymentConfirmationRequest request) {
        Payment payment = findPaymentById(UUID.fromString(request.getPaymentId()));

        if (!payment.getUserId().equals(userId)) {
            throw new BadRequestException("Payment does not belong to this user");
        }

        // Idempotency: the same Razorpay payment must never credit the wallet
        // twice. A re-submitted verify for an already-completed payment returns
        // the existing result instead of re-processing it.
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment already completed — returning existing result: paymentId={}", payment.getId());
            return paymentMapper.toPaymentResponse(payment);
        }

        if (payment.getStatus() != PaymentStatus.INITIATED && payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment cannot be confirmed in status: " + payment.getStatus());
        }

        PaymentGatewayStrategy gatewayStrategy = gatewayRegistry.getStrategy(payment.getGateway());

        if (request.getGatewaySignature() != null) {
            boolean verified = gatewayStrategy.verifySignature(
                    payment, request.getGatewayPaymentId(), request.getGatewaySignature());
            if (!verified) {
                throw new PaymentFailedException("Payment signature verification failed");
            }
        }

        boolean processed = gatewayStrategy.processPayment(payment);
        if (!processed) {
            throw new PaymentFailedException("Payment processing failed at gateway");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayPaymentId(request.getGatewayPaymentId());
        if (request.getGatewayOrderId() != null) {
            payment.setGatewayOrderId(request.getGatewayOrderId());
        }
        payment.setGatewaySignature(request.getGatewaySignature());
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedBy(userId.toString());
        payment = paymentRepository.save(payment);

        savePaymentHistory(payment, PaymentStatus.INITIATED.name(), PaymentStatus.COMPLETED.name(),
                "PAYMENT_COMPLETED", "Payment completed successfully", userId.toString());

        auditPayment(payment, userId, "PAYMENT_COMPLETED",
                "Payment completed: " + payment.getAmount() + " " + payment.getCurrency());

        generateInvoice(payment);
        generateReceipt(payment);

        int attemptCount = paymentAttemptRepository.countByPaymentId(payment.getId()) + 1;
        savePaymentAttempt(payment, attemptCount, payment.getGateway().name(),
                request.getGatewayOrderId(), "Payment confirmed");

        eventPublisher.publishPaymentCompleted(
                payment.getId(), userId, payment.getPaymentNumber(),
                payment.getAmount(), payment.getCredits(), payment.getCurrency(),
                request.getGatewayPaymentId(), request.getGatewayOrderId(),
                payment.getDescription());

        eventPublisher.publishCreditsPurchased(
                payment.getId(), userId, payment.getPaymentNumber(),
                payment.getAmount(), payment.getCredits(),
                payment.getGateway().name(), request.getGatewayPaymentId());

        log.info("Payment completed: paymentId={}, userId={}, amount={}",
                payment.getId(), userId, payment.getAmount());
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse failPayment(UUID userId, PaymentFailureRequest request) {
        Payment payment = findPaymentById(UUID.fromString(request.getPaymentId()));

        if (!payment.getUserId().equals(userId)) {
            throw new BadRequestException("Payment does not belong to this user");
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(request.getFailureReason());
        payment.setFailureCode(request.getFailureCode());
        payment.setUpdatedBy(userId.toString());
        payment = paymentRepository.save(payment);

        savePaymentHistory(payment, null, PaymentStatus.FAILED.name(), "PAYMENT_FAILED",
                "Payment failed: " + request.getFailureReason(), userId.toString());

        auditPayment(payment, userId, "PAYMENT_FAILED",
                "Payment failed: " + request.getFailureReason());

        eventPublisher.publishPaymentFailed(
                payment.getId(), userId, payment.getPaymentNumber(),
                payment.getAmount(), request.getFailureReason(), request.getFailureCode());

        log.warn("Payment failed: paymentId={}, userId={}, reason={}",
                payment.getId(), userId, request.getFailureReason());
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID userId, UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId.toString()));

        if (!payment.getUserId().equals(userId)) {
            throw new BadRequestException("Payment does not belong to this user");
        }

        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getPaymentHistory(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Payment> paymentPage = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<PaymentResponse> content = paymentPage.getContent().stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();

        return PageResponse.of(content, page, size, paymentPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UUID userId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId.toString()));

        if (!invoice.getUserId().equals(userId)) {
            throw new BadRequestException("Invoice does not belong to this user");
        }

        return paymentMapper.toInvoiceResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptResponse getReceipt(UUID userId, UUID receiptId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt", receiptId.toString()));

        if (!receipt.getUserId().equals(userId)) {
            throw new BadRequestException("Receipt does not belong to this user");
        }

        return paymentMapper.toReceiptResponse(receipt);
    }

    // ============================================================
    // Internal Helper Methods
    // ============================================================

    private Payment findPaymentById(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId.toString()));
    }

    private void validateDuplicateReference(String referenceId) {
        if (referenceId != null && !referenceId.isBlank()
                && paymentRepository.existsByReferenceId(referenceId)) {
            throw new DuplicateTransactionException("Duplicate transaction reference: " + referenceId);
        }
    }

    private void savePaymentHistory(Payment payment, String fromStatus, String toStatus,
                                     String action, String description, String performedBy) {
        PaymentHistory history = PaymentHistory.builder()
                .payment(payment)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .action(action)
                .description(description)
                .performedBy(performedBy)
                .build();
        paymentHistoryRepository.save(history);
    }

    private void auditPayment(Payment payment, UUID userId, String action, String description) {
        PaymentAudit audit = PaymentAudit.builder()
                .payment(payment)
                .userId(userId)
                .action(action)
                .description(description)
                .performedBy(userId.toString())
                .build();
        paymentAuditRepository.save(audit);
    }

    private void generateInvoice(Payment payment) {
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .payment(payment)
                .userId(payment.getUserId())
                .status(PaymentStatus.COMPLETED)
                .amount(payment.getAmount())
                .discountAmount(payment.getDiscountAmount())
                .totalAmount(payment.getTotalAmount())
                .currency(payment.getCurrency())
                .description(payment.getDescription())
                .build();
        invoiceRepository.save(invoice);
        log.info("Invoice generated: paymentId={}, invoiceNumber={}", payment.getId(), invoice.getInvoiceNumber());
    }

    private void generateReceipt(Payment payment) {
        Invoice invoice = invoiceRepository.findByPaymentId(payment.getId()).orElse(null);

        Receipt receipt = Receipt.builder()
                .receiptNumber(generateReceiptNumber())
                .payment(payment)
                .invoice(invoice)
                .userId(payment.getUserId())
                .amount(payment.getTotalAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getGateway() != null ? payment.getGateway().name() : "INTERNAL")
                .gatewayTransactionId(payment.getGatewayPaymentId())
                .build();
        receiptRepository.save(receipt);
        log.info("Receipt generated: paymentId={}, receiptNumber={}", payment.getId(), receipt.getReceiptNumber());
    }

    private void savePaymentAttempt(Payment payment, int attemptNumber, String gateway,
                                      String gatewayOrderId, String description) {
        PaymentAttempt attempt = PaymentAttempt.builder()
                .payment(payment)
                .attemptNumber(attemptNumber)
                .status(PaymentStatus.INITIATED)
                .gateway(gateway)
                .gatewayOrderId(gatewayOrderId)
                .attemptedAt(LocalDateTime.now())
                .build();
        paymentAttemptRepository.save(attempt);
        log.debug("Payment attempt saved: paymentId={}, attempt={}", payment.getId(), attemptNumber);
    }

    private String generatePaymentNumber() {
        return "PAY-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(9999));
    }

    private String generateInvoiceNumber() {
        return "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(9999));
    }

    private String generateReceiptNumber() {
        return "RCT-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(9999));
    }
}

package com.skillinfinity.payment.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.payment.dto.request.RefundRequest;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.TransactionResponse;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.entity.PaymentAudit;
import com.skillinfinity.payment.entity.PaymentHistory;
import com.skillinfinity.payment.entity.Refund;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import com.skillinfinity.payment.event.PaymentEventPublisher;
import com.skillinfinity.payment.exception.RefundNotAllowedException;
import com.skillinfinity.payment.gateway.GatewayRegistry;
import com.skillinfinity.payment.mapper.PaymentMapper;
import com.skillinfinity.payment.repository.PaymentAuditRepository;
import com.skillinfinity.payment.repository.PaymentHistoryRepository;
import com.skillinfinity.payment.repository.PaymentRepository;
import com.skillinfinity.payment.repository.RefundRepository;
import com.skillinfinity.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private static final String CACHE_PAYMENT_SUMMARY = "paymentSummary";

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final PaymentAuditRepository paymentAuditRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher eventPublisher;
    private final GatewayRegistry gatewayRegistry;

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_PAYMENT_SUMMARY, "coupon"}, allEntries = true)
    public PaymentResponse requestRefund(UUID userId, RefundRequest request) {
        Payment payment = paymentRepository.findById(UUID.fromString(request.getPaymentId()))
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getPaymentId()));

        if (!payment.getUserId().equals(userId)) {
            throw new BadRequestException("Payment does not belong to this user");
        }

        validateRefundEligibility(payment, request);

        BigDecimal totalRefunded = payment.getRefundedAmount() != null
                ? payment.getRefundedAmount() : BigDecimal.ZERO;
        BigDecimal remainingRefundable = payment.getTotalAmount().subtract(totalRefunded);

        if (request.getAmount().compareTo(remainingRefundable) > 0) {
            throw new RefundNotAllowedException(
                    "Requested refund amount " + request.getAmount()
                            + " exceeds remaining refundable amount " + remainingRefundable);
        }

        Refund refund = Refund.builder()
                .refundNumber(generateRefundNumber())
                .payment(payment)
                .userId(userId)
                .status(PaymentStatus.PENDING)
                .amount(request.getAmount())
                .currency(payment.getCurrency())
                .reason(request.getReason())
                .build();
        refund = refundRepository.save(refund);

        boolean autoApprove = request.getAmount().compareTo(BigDecimal.valueOf(1000)) <= 0;
        if (autoApprove) {
            return approveRefund(userId, refund.getId());
        }

        savePaymentHistory(payment, null, "REFUND_REQUESTED", "REFUND_REQUESTED",
                "Refund requested: " + request.getAmount() + " - " + request.getReason(),
                userId.toString());

        auditPayment(payment, userId, "REFUND_REQUESTED",
                "Refund requested: " + request.getAmount() + " for " + request.getReason());

        log.info("Refund requested: paymentId={}, amount={}, refundId={}",
                payment.getId(), request.getAmount(), refund.getId());
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_PAYMENT_SUMMARY, "coupon"}, allEntries = true)
    public PaymentResponse approveRefund(UUID adminId, UUID refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund", refundId.toString()));

        Payment payment = refund.getPayment();

        gatewayRegistry.getStrategy(payment.getGateway())
                .processRefund(payment, refund.getAmount(), refund.getReason());

        refund.setStatus(PaymentStatus.REFUNDED);
        refund.setIsApproved(true);
        refund.setApprovedBy(adminId.toString());
        refund.setApprovedAt(LocalDateTime.now());
        refund.setRefundedAt(LocalDateTime.now());
        refundRepository.save(refund);

        BigDecimal currentRefunded = payment.getRefundedAmount() != null
                ? payment.getRefundedAmount() : BigDecimal.ZERO;
        payment.setRefundedAmount(currentRefunded.add(refund.getAmount()));

        if (payment.getRefundedAmount().compareTo(payment.getTotalAmount()) >= 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }
        payment.setRefundedAt(LocalDateTime.now());
        payment.setUpdatedBy(adminId.toString());
        paymentRepository.save(payment);

        savePaymentHistory(payment, null, PaymentStatus.REFUNDED.name(), "REFUND_COMPLETED",
                "Refund completed: " + refund.getAmount(), adminId.toString());

        auditPayment(payment, adminId, "REFUND_COMPLETED",
                "Refund completed: " + refund.getAmount());

        eventPublisher.publishRefundCompleted(
                refund.getId(), payment.getId(), payment.getUserId(),
                refund.getRefundNumber(), refund.getAmount(), refund.getReason());

        log.info("Refund completed: refundId={}, paymentId={}, amount={}",
                refundId, payment.getId(), refund.getAmount());
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getRefundHistory(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Refund> refundPage = refundRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<TransactionResponse> content = refundPage.getContent().stream()
                .map(refund -> TransactionResponse.builder()
                        .id(refund.getId())
                        .transactionNumber(refund.getRefundNumber())
                        .transactionType("REFUND")
                        .status(refund.getStatus().name())
                        .amount(refund.getAmount())
                        .currency(refund.getCurrency())
                        .description(refund.getReason())
                        .createdAt(refund.getCreatedAt())
                        .build())
                .toList();

        return PageResponse.of(content, page, size, refundPage.getTotalElements());
    }

    private void validateRefundEligibility(Payment payment, RefundRequest request) {
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RefundNotAllowedException(
                    "Refund is only allowed for completed payments. Current status: " + payment.getStatus());
        }

        if (payment.getPaidAt() != null
                && payment.getPaidAt().plusDays(30).isBefore(LocalDateTime.now())) {
            throw new RefundNotAllowedException(
                    "Refund period of 30 days has passed since payment");
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

    private String generateRefundNumber() {
        return "REF-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(9999));
    }
}

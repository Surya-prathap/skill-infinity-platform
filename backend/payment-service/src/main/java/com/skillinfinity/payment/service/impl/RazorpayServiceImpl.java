package com.skillinfinity.payment.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.common.exception.UnauthorizedException;
import com.skillinfinity.payment.dto.request.CreditPurchaseRequest;
import com.skillinfinity.payment.dto.request.PaymentConfirmationRequest;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.request.RazorpaySubscriptionCheckoutRequest;
import com.skillinfinity.payment.dto.request.RazorpaySubscriptionVerifyRequest;
import com.skillinfinity.payment.dto.request.RazorpayVerifyRequest;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.RazorpayOrderResponse;
import com.skillinfinity.payment.dto.response.RazorpaySubscriptionCheckoutResponse;
import com.skillinfinity.payment.dto.response.SubscriptionPlanResponse;
import com.skillinfinity.payment.entity.CreditPackage;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.entity.SubscriptionHistory;
import com.skillinfinity.payment.entity.SubscriptionPlan;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import com.skillinfinity.payment.enumeration.SubscriptionStatus;
import com.skillinfinity.payment.event.PaymentEventPublisher;
import com.skillinfinity.payment.exception.PaymentFailedException;
import com.skillinfinity.payment.gateway.RazorpayPaymentGateway;
import com.skillinfinity.payment.repository.CreditPackageRepository;
import com.skillinfinity.payment.repository.PaymentRepository;
import com.skillinfinity.payment.repository.SubscriptionHistoryRepository;
import com.skillinfinity.payment.repository.SubscriptionPlanRepository;
import com.skillinfinity.payment.service.PaymentService;
import com.skillinfinity.payment.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Razorpay orchestration (TEST MODE).
 *
 * <p>Security invariants enforced here:</p>
 * <ul>
 *   <li>The Razorpay key secret / webhook secret never leave the server.</li>
 *   <li>Credit package + price are resolved from the database — the frontend
 *       only sends a package code.</li>
 *   <li>Payments are only completed after server-side signature verification.</li>
 *   <li>Every completion path is idempotent — the same Razorpay payment can
 *       never credit the wallet twice.</li>
 *   <li>Webhooks are signature-verified and processed idempotently.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {

    private static final String CURRENCY_INR = "INR";
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final RazorpayPaymentGateway gateway;
    private final PaymentService paymentService;
    private final CreditPackageRepository creditPackageRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionHistoryRepository subscriptionHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher eventPublisher;

    // ============================================================
    // Phase 1 — Credit purchase
    // ============================================================

    @Override
    @Transactional
    public RazorpayOrderResponse createCreditOrder(UUID userId, CreditPurchaseRequest request) {
        CreditPackage pkg = creditPackageRepository.findByCodeAndIsActiveTrue(request.getPackageCode())
                .orElseThrow(() -> new BadRequestException(
                        "Unknown or inactive credit package: " + request.getPackageCode()));

        BigDecimal price = pkg.getPrice();
        BigDecimal discount = activeSubscriptionCreditDiscount(userId, price);
        BigDecimal total = price.subtract(discount).max(ZERO);

        PaymentResponse payment = paymentService.initiatePayment(userId, PaymentRequest.builder()
                .amount(total)
                .credits(pkg.getCredits())
                .currency(CURRENCY_INR)
                .description("Purchase of " + pkg.getCredits().stripTrailingZeros().toPlainString()
                        + " credits (" + pkg.getName() + ")")
                .referenceType("CREDIT_PURCHASE")
                .couponCode(blankToNull(request.getCouponCode()))
                .gateway(PaymentGateway.RAZORPAY.name())
                .build());

        return RazorpayOrderResponse.builder()
                .paymentId(payment.getId().toString())
                .orderId(payment.getGatewayOrderId())
                .amount(toPaise(total))
                .currency(CURRENCY_INR)
                .keyId(gateway.getKeyId())
                .credits(pkg.getCredits())
                .discountAmount(discount)
                .totalAmount(total)
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse verifyCreditPayment(UUID userId, RazorpayVerifyRequest request) {
        // confirmPayment is idempotent — a repeated verify of a completed
        // payment returns the existing result without re-crediting.
        return paymentService.confirmPayment(userId, PaymentConfirmationRequest.builder()
                .paymentId(request.getPaymentId())
                .gatewayPaymentId(request.getRazorpayPaymentId())
                .gatewayOrderId(request.getRazorpayOrderId())
                .gatewaySignature(request.getRazorpaySignature())
                .build());
    }

    // ============================================================
    // Phase 2 — Subscriptions (Razorpay order-based)
    // ============================================================

    @Override
    @Transactional
    public RazorpaySubscriptionCheckoutResponse createSubscriptionCheckout(
            UUID userId, Set<String> roles, RazorpaySubscriptionCheckoutRequest request) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("SubscriptionPlan", request.getPlanId().toString()));

        if (!Boolean.TRUE.equals(plan.getIsActive())) {
            throw new BadRequestException("Subscription plan is not active: " + plan.getName());
        }
        if (plan.getType() == SubscriptionPlanType.MENTOR && !hasRole(roles, "ROLE_MENTOR")) {
            throw new ForbiddenException("Mentor plans require an approved mentor account");
        }
        if (plan.getPrice() == null || plan.getPrice().compareTo(ZERO) <= 0) {
            throw new BadRequestException("Free plans do not require a payment");
        }

        // The subscription is purchased with the SAME one-time Razorpay order
        // flow as credit purchases. The Razorpay test account behind this
        // deployment has no Subscriptions/Plans API access (plans.create and
        // subscriptions.create return "Unauthorized"), so a recurring plan can
        // never be created — but the order + checkout + server-side signature
        // verification pattern works identically and keeps the checkout in
        // Razorpay TEST MODE (INR). credits=0 so no credit-purchase event can
        // ever fire for a subscription payment.
        PaymentResponse payment = paymentService.initiatePayment(userId, PaymentRequest.builder()
                .amount(plan.getPrice())
                .credits(ZERO)
                .currency(CURRENCY_INR)
                .description("Subscription: " + plan.getName() + " (first month)")
                .referenceType("SUBSCRIPTION")
                .gateway(PaymentGateway.RAZORPAY.name())
                .build());

        SubscriptionHistory subscription = SubscriptionHistory.builder()
                .userId(userId)
                .plan(plan)
                .status(SubscriptionStatus.PAYMENT_PENDING)
                .autoRenew(true)
                .paymentId(payment.getId())
                .build();
        subscriptionHistoryRepository.save(subscription);

        log.info("Razorpay subscription checkout created: userId={}, plan={}, orderId={}, paymentId={}",
                userId, plan.getName(), payment.getGatewayOrderId(), payment.getId());
        return RazorpaySubscriptionCheckoutResponse.builder()
                .paymentId(payment.getId().toString())
                .orderId(payment.getGatewayOrderId())
                .keyId(gateway.getKeyId())
                .planId(plan.getId().toString())
                .planName(plan.getName())
                .amount(toPaise(plan.getPrice()))
                .currency(CURRENCY_INR)
                .totalCount(12)
                .build();
    }

    @Override
    @Transactional
    public MySubscriptionResponse verifySubscriptionPayment(UUID userId, RazorpaySubscriptionVerifyRequest request) {
        Payment payment = paymentRepository.findById(UUID.fromString(request.getPaymentId()))
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getPaymentId()));

        if (!payment.getUserId().equals(userId)) {
            throw new BadRequestException("Payment does not belong to this user");
        }

        SubscriptionHistory subscription = subscriptionHistoryRepository
                .findByPaymentId(payment.getId())
                .orElseThrow(() -> new BadRequestException("No subscription linked to this payment"));

        // Idempotent — a re-submitted verify of an already activated subscription.
        if (payment.getStatus() == PaymentStatus.COMPLETED
                && subscription.getStatus() == SubscriptionStatus.ACTIVE) {
            log.info("Subscription payment already verified — returning existing: paymentId={}", payment.getId());
            return toMySubscription(subscription);
        }

        if (request.getRazorpayPaymentId() == null || request.getRazorpaySignature() == null
                || !gateway.verifySignature(payment, request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
            throw new PaymentFailedException("Razorpay subscription signature verification failed");
        }

        completeSubscriptionPayment(payment, request.getRazorpayPaymentId(), request.getRazorpaySignature());
        activateSubscription(subscription);

        eventPublisher.publishSubscriptionActivated(
                subscription.getId(), userId, subscription.getPlan().getId(), subscription.getPlan().getName(),
                subscription.getStartedAt(), subscription.getExpiresAt(), subscription.getAutoRenew());

        log.info("Subscription activated: userId={}, plan={}, subId={}",
                userId, subscription.getPlan().getName(), subscription.getRazorpaySubscriptionId());
        return toMySubscription(subscription);
    }

    // ============================================================
    // Webhooks
    // ============================================================

    @Override
    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!gateway.verifyWebhookSignature(payload, signature)) {
            throw new UnauthorizedException("Invalid Razorpay webhook signature");
        }

        JSONObject body = new JSONObject(payload);
        String event = body.optString("event", "");
        JSONObject entity = body.optJSONObject("payload") != null
                ? body.getJSONObject("payload").optJSONObject("entity")
                : null;

        if (entity == null) {
            log.warn("Razorpay webhook without entity: event={}", event);
            return;
        }

        switch (event) {
            case "payment.captured", "payment.authorized" -> handlePaymentEvent(entity);
            case "subscription.charged" -> handleSubscriptionCharged(entity);
            case "subscription.activated" -> handleSubscriptionStatus(entity, SubscriptionStatus.ACTIVE, true);
            case "subscription.pending" -> handleSubscriptionStatus(entity, SubscriptionStatus.PAYMENT_PENDING, false);
            case "subscription.cancelled" -> handleSubscriptionStatus(entity, SubscriptionStatus.CANCELLED, false);
            case "subscription.completed" -> handleSubscriptionStatus(entity, SubscriptionStatus.CANCELLED, false);
            case "subscription.ended" -> handleSubscriptionStatus(entity, SubscriptionStatus.EXPIRED, false);
            case "subscription.halted", "subscription.resumed", "subscription.paused" ->
                    log.info("Razorpay webhook {} — no action for Skill Infinity", event);
            default -> log.info("Razorpay webhook event ignored: {}", event);
        }
    }

    /** payment.captured / payment.authorized for a one-time credit order. */
    private void handlePaymentEvent(JSONObject entity) {
        String razorpayPaymentId = entity.optString("id", null);
        String razorpayOrderId = entity.optString("order_id", null);
        if (razorpayPaymentId == null && razorpayOrderId == null) {
            log.warn("Razorpay payment webhook missing ids");
            return;
        }

        Optional<Payment> paymentOpt = razorpayPaymentId != null
                ? paymentRepository.findByGatewayPaymentId(razorpayPaymentId)
                : Optional.empty();
        if (paymentOpt.isEmpty() && razorpayOrderId != null) {
            paymentOpt = paymentRepository.findByGatewayOrderId(razorpayOrderId);
        }
        if (paymentOpt.isEmpty()) {
            log.warn("Razorpay payment webhook for unknown payment: paymentId={}, orderId={}",
                    razorpayPaymentId, razorpayOrderId);
            return;
        }

        Payment payment = paymentOpt.get();
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Razorpay payment already completed — skipping webhook: paymentId={}", payment.getId());
            return;
        }
        if (payment.getStatus() != PaymentStatus.INITIATED && payment.getStatus() != PaymentStatus.PENDING) {
            log.warn("Razorpay webhook for non-actionable payment: paymentId={}, status={}",
                    payment.getId(), payment.getStatus());
            return;
        }

        // Subscription payments are completed by the frontend verify call (which
        // also activates the plan) — never by the generic payment webhook, so the
        // two paths can never race and activate twice.
        if ("SUBSCRIPTION".equals(payment.getReferenceType())) {
            log.info("Razorpay payment webhook for subscription order — activation is handled by verify: paymentId={}",
                    payment.getId());
            return;
        }

        completeCreditPayment(payment, razorpayPaymentId);
    }

    /** subscription.charged — first or recurring charge for a subscription. */
    private void handleSubscriptionCharged(JSONObject entity) {
        String razorpaySubscriptionId = entity.optString("id", null);
        JSONObject paymentEntity = entity.optJSONObject("payment") != null
                ? entity.getJSONObject("payment").optJSONObject("entity")
                : null;
        String razorpayPaymentId = paymentEntity != null ? paymentEntity.optString("id", null) : null;

        if (razorpaySubscriptionId == null) {
            log.warn("Razorpay subscription.charged webhook missing subscription id");
            return;
        }
        SubscriptionHistory subscription = subscriptionHistoryRepository
                .findByRazorpaySubscriptionId(razorpaySubscriptionId)
                .orElse(null);
        if (subscription == null) {
            log.warn("Razorpay subscription.charged for unknown subscription: {}", razorpaySubscriptionId);
            return;
        }

        // A recurring charge has no linked internal payment yet — create one so
        // payment history stays complete; the first-charge payment is completed.
        if (subscription.getPaymentId() != null && razorpayPaymentId != null) {
            paymentRepository.findById(subscription.getPaymentId()).ifPresent(payment -> {
                if (payment.getStatus() != PaymentStatus.COMPLETED) {
                    completeSubscriptionPayment(payment, razorpayPaymentId, null);
                }
            });
        } else if (razorpayPaymentId != null && paymentRepository.findByGatewayPaymentId(razorpayPaymentId).isEmpty()) {
            recordRecurringCharge(subscription, razorpayPaymentId);
        }

        if (subscription.getStatus() == SubscriptionStatus.PAYMENT_PENDING
                || subscription.getStatus() == SubscriptionStatus.PENDING) {
            activateSubscription(subscription);
            eventPublisher.publishSubscriptionActivated(
                    subscription.getId(), subscription.getUserId(), subscription.getPlan().getId(),
                    subscription.getPlan().getName(), subscription.getStartedAt(),
                    subscription.getExpiresAt(), subscription.getAutoRenew());
        } else if (subscription.getStatus() == SubscriptionStatus.ACTIVE) {
            extendSubscription(subscription);
        }
    }

    private void handleSubscriptionStatus(JSONObject entity, SubscriptionStatus status, boolean renew) {
        String razorpaySubscriptionId = entity.optString("id", null);
        if (razorpaySubscriptionId == null) {
            log.warn("Razorpay subscription webhook missing subscription id");
            return;
        }
        SubscriptionHistory subscription = subscriptionHistoryRepository
                .findByRazorpaySubscriptionId(razorpaySubscriptionId)
                .orElse(null);
        if (subscription == null) {
            log.warn("Razorpay subscription webhook for unknown subscription: {}", razorpaySubscriptionId);
            return;
        }

        if (status == SubscriptionStatus.ACTIVE) {
            if (subscription.getStatus() == SubscriptionStatus.PAYMENT_PENDING
                    || subscription.getStatus() == SubscriptionStatus.PENDING) {
                activateSubscription(subscription);
                eventPublisher.publishSubscriptionActivated(
                        subscription.getId(), subscription.getUserId(), subscription.getPlan().getId(),
                        subscription.getPlan().getName(), subscription.getStartedAt(),
                        subscription.getExpiresAt(), subscription.getAutoRenew());
            }
            return;
        }

        subscription.setStatus(status);
        if (status == SubscriptionStatus.CANCELLED || status == SubscriptionStatus.EXPIRED) {
            subscription.setAutoRenew(false);
            if (subscription.getCancelledAt() == null) {
                subscription.setCancelledAt(LocalDateTime.now());
            }
        }
        subscriptionHistoryRepository.save(subscription);
        log.info("Razorpay subscription status updated: subId={}, status={}", razorpaySubscriptionId, status);
    }

    // ============================================================
    // Helpers
    // ============================================================

    /** Discount on credit purchases while the user has an active paid plan. */
    private BigDecimal activeSubscriptionCreditDiscount(UUID userId, BigDecimal price) {
        SubscriptionHistory active = subscriptionHistoryRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .orElse(null);
        if (active == null || active.getExpiresAt() == null || active.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ZERO;
        }
        BigDecimal percent = active.getPlan().getCreditDiscountPercent();
        if (percent == null || percent.compareTo(ZERO) <= 0) {
            return ZERO;
        }
        BigDecimal discount = price.multiply(percent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        log.info("Credit purchase discount applied: userId={}, plan={}, percent={}%, discount={}",
                userId, active.getPlan().getName(), percent, discount);
        return discount;
    }

    /** Completes a one-time credit payment and publishes the wallet credit event. */
    private void completeCreditPayment(Payment payment, String razorpayPaymentId) {
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayPaymentId(razorpayPaymentId);
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedBy("razorpay-webhook");
        payment = paymentRepository.save(payment);

        eventPublisher.publishPaymentCompleted(
                payment.getId(), payment.getUserId(), payment.getPaymentNumber(),
                payment.getAmount(), payment.getCredits(), payment.getCurrency(),
                razorpayPaymentId, payment.getGatewayOrderId(), payment.getDescription());
        eventPublisher.publishCreditsPurchased(
                payment.getId(), payment.getUserId(), payment.getPaymentNumber(),
                payment.getAmount(), payment.getCredits(),
                PaymentGateway.RAZORPAY.name(), razorpayPaymentId);

        log.info("Razorpay webhook completed credit payment: paymentId={}, credits={}",
                payment.getId(), payment.getCredits());
    }

    /** Completes the subscription's internal payment record (no credits event). */
    private void completeSubscriptionPayment(Payment payment, String razorpayPaymentId, String signature) {
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayPaymentId(razorpayPaymentId);
        if (signature != null) {
            payment.setGatewaySignature(signature);
        }
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedBy(payment.getCreatedBy());
        paymentRepository.save(payment);

        eventPublisher.publishPaymentCompleted(
                payment.getId(), payment.getUserId(), payment.getPaymentNumber(),
                payment.getAmount(), payment.getCredits(), payment.getCurrency(),
                razorpayPaymentId, null, payment.getDescription());
        log.info("Subscription payment completed: paymentId={}, razorpayPaymentId={}",
                payment.getId(), razorpayPaymentId);
    }

    private void activateSubscription(SubscriptionHistory subscription) {
        SubscriptionPlan plan = subscription.getPlan();
        LocalDateTime now = LocalDateTime.now();
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartedAt(now);
        subscription.setExpiresAt(now.plusDays(plan.getDurationDays() != null ? plan.getDurationDays() : 30));
        subscription.setAutoRenew(true);
        subscriptionHistoryRepository.save(subscription);
    }

    private void extendSubscription(SubscriptionHistory subscription) {
        LocalDateTime base = subscription.getExpiresAt() != null
                ? subscription.getExpiresAt()
                : LocalDateTime.now();
        subscription.setExpiresAt(base.plusDays(subscription.getPlan().getDurationDays() != null
                ? subscription.getPlan().getDurationDays() : 30));
        subscriptionHistoryRepository.save(subscription);
        log.info("Subscription extended: subId={}, newExpiry={}", subscription.getId(), subscription.getExpiresAt());
    }

    /** Records a recurring (month 2+) charge as its own completed payment row. */
    private void recordRecurringCharge(SubscriptionHistory subscription, String razorpayPaymentId) {
        Payment recurring = Payment.builder()
                .userId(subscription.getUserId())
                .paymentNumber("SUB-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .status(PaymentStatus.COMPLETED)
                .amount(subscription.getPlan().getPrice())
                .currency(CURRENCY_INR)
                .credits(ZERO)
                .gateway(PaymentGateway.RAZORPAY)
                .gatewayPaymentId(razorpayPaymentId)
                .description("Subscription renewal: " + subscription.getPlan().getName())
                .referenceType("SUBSCRIPTION")
                .paidAt(LocalDateTime.now())
                .createdBy(subscription.getUserId().toString())
                .updatedBy(subscription.getUserId().toString())
                .build();
        paymentRepository.save(recurring);
        log.info("Recurring subscription charge recorded: paymentId={}, subId={}",
                recurring.getId(), subscription.getId());
    }

    private MySubscriptionResponse toMySubscription(SubscriptionHistory subscription) {
        SubscriptionPlan plan = subscription.getPlan();
        SubscriptionPlanResponse planResponse = SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .type(plan.getType())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .durationDays(plan.getDurationDays())
                .maxSessionsPerMonth(plan.getMaxSessionsPerMonth())
                .creditDiscountPercent(plan.getCreditDiscountPercent())
                .features(plan.getFeatures() != null
                        ? java.util.Arrays.stream(plan.getFeatures().split("[,\\n]"))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList()
                        : List.of())
                .active(plan.getIsActive())
                .build();
        return MySubscriptionResponse.builder()
                .subscriptionId(subscription.getId())
                .plan(planResponse)
                .status(subscription.getStatus().name())
                .startedAt(subscription.getStartedAt())
                .expiresAt(subscription.getExpiresAt())
                .autoRenew(subscription.getAutoRenew())
                .build();
    }

    private boolean hasRole(Set<String> roles, String role) {
        if (roles == null || roles.isEmpty()) {
            return false;
        }
        return roles.contains(role) || roles.contains(role.replace("ROLE_", ""));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Long toPaise(BigDecimal amountInr) {
        if (amountInr == null) {
            return 0L;
        }
        return amountInr.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }
}

package com.skillinfinity.payment.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.request.SubscriptionRequest;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.TransactionResponse;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.entity.SubscriptionHistory;
import com.skillinfinity.payment.entity.SubscriptionPlan;
import com.skillinfinity.payment.enumeration.SubscriptionStatus;
import com.skillinfinity.payment.event.PaymentEventPublisher;
import com.skillinfinity.payment.exception.SubscriptionExpiredException;
import com.skillinfinity.payment.mapper.PaymentMapper;
import com.skillinfinity.payment.repository.PaymentRepository;
import com.skillinfinity.payment.repository.SubscriptionHistoryRepository;
import com.skillinfinity.payment.repository.SubscriptionPlanRepository;
import com.skillinfinity.payment.service.PaymentService;
import com.skillinfinity.payment.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final String CACHE_SUBSCRIPTION_STATUS = "subscriptionStatus";

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionHistoryRepository subscriptionHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher eventPublisher;

    @Override
    @Transactional
    @CacheEvict(value = CACHE_SUBSCRIPTION_STATUS, key = "#userId")
    public PaymentResponse purchaseSubscription(UUID userId, SubscriptionRequest request) {
        validateSubscriptionActive(userId);

        SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("SubscriptionPlan", request.getPlanId().toString()));

        if (!Boolean.TRUE.equals(plan.getIsActive())) {
            throw new BadRequestException("Subscription plan is not active: " + plan.getName());
        }

        PaymentResponse paymentResponse = paymentService.initiatePayment(userId, PaymentRequest.builder()
                .amount(plan.getPrice())
                .currency(plan.getCurrency())
                .description("Subscription: " + plan.getName())
                .referenceType("SUBSCRIPTION")
                .couponCode(request.getCouponCode())
                .subscriptionPlanId(request.getPlanId())
                .build());

        Payment payment = paymentRepository.findByPaymentNumber(paymentResponse.getPaymentNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentResponse.getPaymentNumber()));

        SubscriptionHistory subscription = SubscriptionHistory.builder()
                .userId(userId)
                .plan(plan)
                .status(SubscriptionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .autoRenew(request.getAutoRenew())
                .paymentId(payment.getId())
                .build();
        subscription = subscriptionHistoryRepository.save(subscription);

        eventPublisher.publishSubscriptionActivated(
                subscription.getId(), userId, plan.getId(), plan.getName(),
                subscription.getStartedAt(), subscription.getExpiresAt(), subscription.getAutoRenew());

        log.info("Subscription purchased: userId={}, plan={}, subscriptionId={}",
                userId, plan.getName(), subscription.getId());
        return paymentResponse;
    }

    @Override
    @Transactional
    @CacheEvict(value = CACHE_SUBSCRIPTION_STATUS, key = "#userId")
    public PaymentResponse cancelSubscription(UUID userId, UUID subscriptionId) {
        validateSubscriptionActive(userId);

        SubscriptionHistory subscription = subscriptionHistoryRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", subscriptionId.toString()));

        if (!subscription.getUserId().equals(userId)) {
            throw new BadRequestException("Subscription does not belong to this user");
        }

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new BadRequestException("Subscription is not active. Current status: " + subscription.getStatus());
        }

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setAutoRenew(false);
        subscriptionHistoryRepository.save(subscription);

        log.info("Subscription cancelled: userId={}, subscriptionId={}", userId, subscriptionId);
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getSubscriptionHistory(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SubscriptionHistory> subscriptionPage = subscriptionHistoryRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<TransactionResponse> content = subscriptionPage.getContent().stream()
                .map(sub -> TransactionResponse.builder()
                        .id(sub.getId())
                        .transactionNumber(sub.getPlan().getName())
                        .transactionType("SUBSCRIPTION")
                        .status(sub.getStatus().name())
                        .amount(sub.getPlan().getPrice())
                        .currency(sub.getPlan().getCurrency())
                        .description("Subscription: " + sub.getPlan().getName())
                        .createdAt(sub.getCreatedAt())
                        .build())
                .toList();

        return PageResponse.of(content, page, size, subscriptionPage.getTotalElements());
    }

    private void validateSubscriptionActive(UUID userId) {
        subscriptionHistoryRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .ifPresent(sub -> {
                    if (sub.getExpiresAt() != null && sub.getExpiresAt().isBefore(LocalDateTime.now())) {
                        sub.setStatus(SubscriptionStatus.EXPIRED);
                        subscriptionHistoryRepository.save(sub);
                        throw new SubscriptionExpiredException(
                                "Subscription has expired on: " + sub.getExpiresAt());
                    }
                });
    }
}

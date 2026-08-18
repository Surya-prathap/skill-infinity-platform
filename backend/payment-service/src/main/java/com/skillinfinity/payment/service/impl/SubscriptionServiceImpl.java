package com.skillinfinity.payment.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.SubscriptionPlanResponse;
import com.skillinfinity.payment.entity.SubscriptionHistory;
import com.skillinfinity.payment.entity.SubscriptionPlan;
import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import com.skillinfinity.payment.enumeration.SubscriptionStatus;
import com.skillinfinity.payment.exception.SubscriptionExpiredException;
import com.skillinfinity.payment.repository.SubscriptionHistoryRepository;
import com.skillinfinity.payment.repository.SubscriptionPlanRepository;
import com.skillinfinity.payment.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {


    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionHistoryRepository subscriptionHistoryRepository;

    @Override
    @Transactional
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

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getActivePlans(SubscriptionPlanType type) {
        List<SubscriptionPlan> plans = type != null
                ? subscriptionPlanRepository.findByTypeAndIsActiveTrueOrderByPriceAsc(type)
                : subscriptionPlanRepository.findByIsActiveTrueOrderByPriceAsc();
        return plans.stream()
                .map(this::toPlanResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MySubscriptionResponse getMySubscription(UUID userId) {
        return subscriptionHistoryRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .map(sub -> MySubscriptionResponse.builder()
                        .subscriptionId(sub.getId())
                        .plan(toPlanResponse(sub.getPlan()))
                        .status(sub.getStatus().name())
                        .startedAt(sub.getStartedAt())
                        .expiresAt(sub.getExpiresAt())
                        .autoRenew(sub.getAutoRenew())
                        .build())
                .orElse(null);
    }

    private SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
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
    }
}

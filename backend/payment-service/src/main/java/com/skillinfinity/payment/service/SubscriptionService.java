package com.skillinfinity.payment.service;

import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.SubscriptionPlanResponse;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    PaymentResponse cancelSubscription(UUID userId, UUID subscriptionId);

    List<SubscriptionPlanResponse> getActivePlans(SubscriptionPlanType type);

    MySubscriptionResponse getMySubscription(UUID userId);
}

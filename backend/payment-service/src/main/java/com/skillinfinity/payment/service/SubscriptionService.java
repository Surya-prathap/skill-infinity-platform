package com.skillinfinity.payment.service;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.payment.dto.request.SubscriptionRequest;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.SubscriptionPlanResponse;
import com.skillinfinity.payment.dto.response.TransactionResponse;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    PaymentResponse purchaseSubscription(UUID userId, SubscriptionRequest request);

    PaymentResponse cancelSubscription(UUID userId, UUID subscriptionId);

    PageResponse<TransactionResponse> getSubscriptionHistory(UUID userId, int page, int size);

    List<SubscriptionPlanResponse> getActivePlans();

    MySubscriptionResponse getMySubscription(UUID userId);
}

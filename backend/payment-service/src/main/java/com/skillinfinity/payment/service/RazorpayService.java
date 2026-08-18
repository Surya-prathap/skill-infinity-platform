package com.skillinfinity.payment.service;

import com.skillinfinity.payment.dto.request.CreditPurchaseRequest;
import com.skillinfinity.payment.dto.request.RazorpaySubscriptionCheckoutRequest;
import com.skillinfinity.payment.dto.request.RazorpaySubscriptionVerifyRequest;
import com.skillinfinity.payment.dto.request.RazorpayVerifyRequest;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.RazorpayOrderResponse;
import com.skillinfinity.payment.dto.response.RazorpaySubscriptionCheckoutResponse;

import java.util.Set;
import java.util.UUID;

public interface RazorpayService {

    /**
     * Creates a Razorpay order for a credit package. The package, credits and
     * final INR amount (after any active-subscription discount) are resolved
     * server-side — never from the frontend.
     */
    RazorpayOrderResponse createCreditOrder(UUID userId, CreditPurchaseRequest request);

    /**
     * Verifies the Razorpay payment signature server-side and completes the
     * payment, which credits the wallet exactly once (idempotent).
     */
    PaymentResponse verifyCreditPayment(UUID userId, RazorpayVerifyRequest request);

    /**
     * Creates a Razorpay recurring subscription for a plan (mentor plans
     * require an approved mentor). Returns checkout details.
     */
    RazorpaySubscriptionCheckoutResponse createSubscriptionCheckout(
            UUID userId, Set<String> roles, RazorpaySubscriptionCheckoutRequest request);

    /** Verifies the first subscription charge and activates the subscription. */
    MySubscriptionResponse verifySubscriptionPayment(UUID userId, RazorpaySubscriptionVerifyRequest request);

    /** Handles a verified Razorpay webhook event (idempotent). */
    void handleWebhook(String payload, String signature);
}

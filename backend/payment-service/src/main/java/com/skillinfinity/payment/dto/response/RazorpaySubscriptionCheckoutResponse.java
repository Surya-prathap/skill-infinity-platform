package com.skillinfinity.payment.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Razorpay subscription checkout details")
public class RazorpaySubscriptionCheckoutResponse {

    @Schema(description = "Internal payment ID used when verifying", requiredMode = Schema.RequiredMode.REQUIRED)
    private String paymentId;

    /**
     * Razorpay order ID for the plan's first month — the subscription checkout
     * opens with the same one-time order flow as credit purchases (the Razorpay
     * test account has no recurring subscription API access).
     */
    @Schema(description = "Razorpay order ID (razorpay_order_id)", example = "order_xxxxxxxx")
    private String orderId;

    /** Razorpay Key ID — safe for the browser. */
    @Schema(description = "Razorpay Key ID for the checkout", example = "rzp_test_xxxx")
    private String keyId;

    @Schema(description = "Subscription plan ID")
    private String planId;

    @Schema(description = "Plan name", example = "Learner Plus")
    private String planName;

    /** First charge amount in paise. */
    @Schema(description = "First charge in paise (₹99 → 9900)", example = "9900")
    private Long amount;

    @Schema(description = "Currency — always INR", example = "INR")
    private String currency;

    @Schema(description = "Number of billing cycles", example = "12")
    private Integer totalCount;
}

package com.skillinfinity.payment.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Everything the Razorpay Checkout needs. The Key ID is safe to expose to the
 * frontend; the Key Secret is never included.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Razorpay order details for opening the checkout")
public class RazorpayOrderResponse {

    @Schema(description = "Internal payment ID used when verifying", requiredMode = Schema.RequiredMode.REQUIRED)
    private String paymentId;

    @Schema(description = "Razorpay order ID", example = "order_xxxxxxxx")
    private String orderId;

    /** Amount in paise — what the Razorpay Checkout expects. */
    @Schema(description = "Amount in paise (₹109 → 10900)", example = "10900")
    private Long amount;

    @Schema(description = "Currency — always INR", example = "INR")
    private String currency;

    /** Razorpay Key ID (test mode) — safe for the browser. */
    @Schema(description = "Razorpay Key ID for the checkout", example = "rzp_test_xxxx")
    private String keyId;

    @Schema(description = "Credits granted by this purchase", example = "10")
    private BigDecimal credits;

    @Schema(description = "Discount applied (INR)")
    private BigDecimal discountAmount;

    @Schema(description = "Total payable (INR)")
    private BigDecimal totalAmount;
}

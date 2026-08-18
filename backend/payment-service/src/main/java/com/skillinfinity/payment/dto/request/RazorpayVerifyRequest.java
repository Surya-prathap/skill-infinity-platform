package com.skillinfinity.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Razorpay payment verification payload returned by the checkout")
public class RazorpayVerifyRequest {

    @NotBlank(message = "Payment ID is required")
    @Schema(description = "Internal payment ID returned by /orders", requiredMode = Schema.RequiredMode.REQUIRED)
    private String paymentId;

    @Schema(description = "Razorpay payment ID (razorpay_payment_id)", example = "pay_xxxxxxxx")
    private String razorpayPaymentId;

    @Schema(description = "Razorpay order ID (razorpay_order_id)", example = "order_xxxxxxxx")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay signature is required")
    @Schema(description = "Razorpay signature (razorpay_signature)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String razorpaySignature;
}

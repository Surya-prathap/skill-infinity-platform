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
@Schema(description = "Request to confirm a payment")
public class PaymentConfirmationRequest {

    @NotBlank(message = "Payment ID is required")
    @Schema(description = "Payment ID", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String paymentId;

    @Schema(description = "Gateway payment ID", example = "pay_1234567890")
    private String gatewayPaymentId;

    @Schema(description = "Gateway order ID", example = "order_1234567890")
    private String gatewayOrderId;

    @Schema(description = "Gateway signature for verification", example = "sig_1234567890")
    private String gatewaySignature;

    @Schema(description = "Gateway transaction ID", example = "txn_1234567890")
    private String gatewayTransactionId;
}

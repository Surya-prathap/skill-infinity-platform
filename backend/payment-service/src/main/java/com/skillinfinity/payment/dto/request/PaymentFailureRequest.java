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
@Schema(description = "Request to report a payment failure")
public class PaymentFailureRequest {

    @NotBlank(message = "Payment ID is required")
    @Schema(description = "Payment ID", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String paymentId;

    @Schema(description = "Failure reason", example = "Insufficient funds")
    private String failureReason;

    @Schema(description = "Failure code", example = "INSUFFICIENT_FUNDS")
    private String failureCode;

    @Schema(description = "Gateway response details")
    private String gatewayResponse;
}

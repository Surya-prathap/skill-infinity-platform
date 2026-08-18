package com.skillinfinity.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to initiate a payment")
public class PaymentRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Schema(description = "Amount", example = "109.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal amount;

    @Schema(description = "Number of credits purchased with this payment", example = "10")
    private BigDecimal credits;

    @Schema(description = "Currency", example = "INR")
    @Builder.Default
    private String currency = "INR";

    @Schema(description = "Description of the payment", example = "Purchase of 100 credits")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Schema(description = "Reference ID for tracking", example = "ORD-12345")
    @Size(max = 100, message = "Reference ID cannot exceed 100 characters")
    private String referenceId;

    @Schema(description = "Reference type", example = "ORDER")
    @Size(max = 50, message = "Reference type cannot exceed 50 characters")
    private String referenceType;

    @Schema(description = "Coupon code to apply", example = "WELCOME20")
    @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
    private String couponCode;

    @Schema(description = "Payment gateway to use", example = "INTERNAL")
    @Builder.Default
    private String gateway = "INTERNAL";

    @Schema(description = "ID of the subscription plan (for subscription purchases)")
    private UUID subscriptionPlanId;
}

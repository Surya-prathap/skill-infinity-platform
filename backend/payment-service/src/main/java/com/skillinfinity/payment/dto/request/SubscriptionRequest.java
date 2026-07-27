package com.skillinfinity.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to purchase a subscription")
public class SubscriptionRequest {

    @NotNull(message = "Plan ID is required")
    @Schema(description = "Subscription plan ID", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID planId;

    @Schema(description = "Whether to auto-renew the subscription", example = "true")
    @Builder.Default
    private Boolean autoRenew = true;

    @Schema(description = "Coupon code to apply", example = "SUBSCRIPTION20")
    private String couponCode;
}

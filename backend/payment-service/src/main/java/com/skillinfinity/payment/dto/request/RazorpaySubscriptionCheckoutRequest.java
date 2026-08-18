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
@Schema(description = "Request to start a Razorpay subscription checkout for a plan")
public class RazorpaySubscriptionCheckoutRequest {

    @NotNull(message = "Plan ID is required")
    @Schema(description = "Subscription plan ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID planId;
}

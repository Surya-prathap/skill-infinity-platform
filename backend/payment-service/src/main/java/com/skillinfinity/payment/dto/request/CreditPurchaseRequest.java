package com.skillinfinity.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to buy a credit package — the backend resolves the price")
public class CreditPurchaseRequest {

    @NotBlank(message = "Package code is required")
    @Size(max = 30, message = "Package code cannot exceed 30 characters")
    @Schema(description = "Credit package code, e.g. CREDIT_10", example = "CREDIT_10", requiredMode = Schema.RequiredMode.REQUIRED)
    private String packageCode;

    @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
    @Schema(description = "Optional coupon code", example = "WELCOME20")
    private String couponCode;
}

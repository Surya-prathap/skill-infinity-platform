package com.skillinfinity.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to validate and apply a coupon")
public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
    @Schema(description = "Coupon code to validate", example = "WELCOME20", requiredMode = Schema.RequiredMode.REQUIRED)
    private String couponCode;

    @NotNull(message = "Amount is required")
    @Schema(description = "Purchase amount to validate against coupon", example = "100.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal amount;

    @Schema(description = "User ID applying the coupon")
    private String userId;
}

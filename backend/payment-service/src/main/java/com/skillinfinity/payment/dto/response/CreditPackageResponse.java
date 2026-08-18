package com.skillinfinity.payment.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Public credit package shown on the Buy Credits screen. The backend (database)
 * decides credits + price — the frontend only picks a package code.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Credit package available for purchase")
public class CreditPackageResponse {

    @Schema(description = "Stable package code sent back when buying", example = "CREDIT_10")
    private String code;

    @Schema(description = "Display name", example = "Starter")
    private String name;

    @Schema(description = "Number of credits granted", example = "10")
    private BigDecimal credits;

    @Schema(description = "Price in INR (₹)", example = "109.00")
    private BigDecimal price;

    @Schema(description = "Currency — always INR", example = "INR")
    private String currency;

    @Schema(description = "Recommended / popular flag")
    private Boolean highlighted;

    @Schema(description = "Features shown on the pack card")
    private java.util.List<String> features;

    @Schema(description = "Whether the pack is currently purchasable")
    private Boolean active;
}

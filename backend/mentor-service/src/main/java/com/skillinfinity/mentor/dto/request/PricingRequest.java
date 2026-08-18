package com.skillinfinity.mentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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
public class PricingRequest {

    @NotBlank(message = "Session type is required")
    @Size(max = 50, message = "Session type must not exceed 50 characters")
    private String sessionType;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @Positive(message = "Original price must be positive")
    private BigDecimal originalPrice;

    @Size(max = 3, message = "Currency must be a 3-letter code")
    private String currency;

    private Integer discountPercentage;

    private Integer durationMinutes;

    private boolean isFree;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}

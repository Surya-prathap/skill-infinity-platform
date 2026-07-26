package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PricingResponse {

    private UUID id;
    private String sessionType;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String currency;
    private Integer discountPercentage;
    private Integer durationMinutes;
    private boolean isFree;
    private String description;
    private boolean active;
}

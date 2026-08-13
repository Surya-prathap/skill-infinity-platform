package com.skillinfinity.payment.dto.response;

import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanResponse {

    private UUID id;
    private String name;
    private SubscriptionPlanType type;
    private String description;
    private BigDecimal price;
    private String currency;
    private Integer durationDays;
    private Integer maxSessionsPerMonth;
    /** Comma/newline separated benefit list. */
    private List<String> features;
    private Boolean active;
}

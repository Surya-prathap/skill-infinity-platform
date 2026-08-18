package com.skillinfinity.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MySubscriptionResponse {

    private UUID subscriptionId;
    private SubscriptionPlanResponse plan;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Boolean autoRenew;
}

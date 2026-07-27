package com.skillinfinity.wallet.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RewardResponse {

    private UUID id;
    private String rewardType;
    private BigDecimal amount;
    private String description;
    private String reason;
    private String referenceId;
    private LocalDateTime expiresAt;
    private boolean redeemed;
    private LocalDateTime redeemedAt;
    private LocalDateTime createdAt;
}

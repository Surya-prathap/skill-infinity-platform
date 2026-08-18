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
public class WalletResponse {

    private UUID id;
    private UUID userId;
    private String walletNumber;
    private String status;
    private BigDecimal totalCreditsPurchased;
    private BigDecimal totalCreditsSpent;
    private BigDecimal totalCreditsEarned;
    private BigDecimal totalBonus;
    private BigDecimal totalRefunds;
    private BigDecimal frozenAmount;
    private LocalDateTime lastTransactionAt;
    private WalletBalanceResponse balance;
    private LocalDateTime createdAt;
}

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
public class WalletStatisticsResponse {

    private UUID id;
    private long totalTransactions;
    private long successfulTransactions;
    private long failedTransactions;
    private BigDecimal totalCreditsIn;
    private BigDecimal totalCreditsOut;
    private BigDecimal averageTransactionAmount;
    private BigDecimal largestCredit;
    private BigDecimal largestDebit;
    private long activeDays;
    private LocalDateTime lastActivityDate;
}

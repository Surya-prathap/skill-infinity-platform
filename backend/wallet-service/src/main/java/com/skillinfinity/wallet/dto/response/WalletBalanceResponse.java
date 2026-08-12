package com.skillinfinity.wallet.dto.response;

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
public class WalletBalanceResponse {

    private UUID id;
    private BigDecimal currentBalance;
    private BigDecimal availableBalance;
    private BigDecimal frozenBalance;
    private BigDecimal pendingBalance;

    /** Credit-type buckets — Welcome, Purchased, Learning, Withdrawable. */
    private BigDecimal welcomeBalance;
    private BigDecimal purchasedBalance;
    private BigDecimal learningBalance;
    private BigDecimal withdrawableBalance;

    private String currency;
}

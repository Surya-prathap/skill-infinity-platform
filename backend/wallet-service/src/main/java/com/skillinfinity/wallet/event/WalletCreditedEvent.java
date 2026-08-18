package com.skillinfinity.wallet.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletCreditedEvent implements Serializable {

    private UUID walletId;
    private UUID userId;
    private UUID transactionId;
    private String transactionNumber;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String referenceId;
    private String referenceType;
    private LocalDateTime timestamp;
}

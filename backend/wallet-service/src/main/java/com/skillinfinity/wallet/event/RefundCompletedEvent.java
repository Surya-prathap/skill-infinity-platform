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
public class RefundCompletedEvent implements Serializable {

    private UUID walletId;
    private UUID userId;
    private UUID originalTransactionId;
    private UUID refundTransactionId;
    private BigDecimal refundAmount;
    private String reason;
    private BigDecimal balanceAfter;
    private LocalDateTime timestamp;
}

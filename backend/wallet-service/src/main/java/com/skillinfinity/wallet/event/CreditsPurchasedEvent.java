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
public class CreditsPurchasedEvent implements Serializable {

    private UUID walletId;
    private UUID userId;
    private UUID transactionId;
    private String transactionNumber;
    private BigDecimal amount;
    private String paymentGatewayRef;
    private BigDecimal balanceAfter;
    private LocalDateTime timestamp;
}

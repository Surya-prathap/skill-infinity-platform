package com.skillinfinity.payment.event;

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
public class PaymentFailedEvent implements Serializable {

    private UUID paymentId;
    private UUID userId;
    private String paymentNumber;
    private BigDecimal amount;
    private String failureReason;
    private String failureCode;
    private LocalDateTime timestamp;
}

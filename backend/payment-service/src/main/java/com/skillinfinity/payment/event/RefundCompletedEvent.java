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
public class RefundCompletedEvent implements Serializable {

    private UUID refundId;
    private UUID paymentId;
    private UUID userId;
    private String refundNumber;
    private BigDecimal refundAmount;
    private String reason;
    private LocalDateTime timestamp;
}

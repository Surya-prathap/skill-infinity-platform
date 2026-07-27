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
public class TransactionResponse {

    private UUID id;
    private String transactionNumber;
    private String transactionType;
    private String status;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String currency;
    private String description;
    private String referenceId;
    private String referenceType;
    private UUID sessionId;
    private UUID mentorId;
    private String paymentGatewayRef;
    private String failureReason;
    private LocalDateTime createdAt;
}

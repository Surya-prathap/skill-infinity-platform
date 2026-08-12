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
public class WithdrawalResponse {

    private UUID id;
    private UUID userId;
    private BigDecimal amountCredits;
    private BigDecimal grossAmountInr;
    private BigDecimal platformFeeInr;
    private BigDecimal netAmountInr;
    private String status;
    private String bankDetails;
    private String rejectionReason;
    private String transactionRef;
    private UUID reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}

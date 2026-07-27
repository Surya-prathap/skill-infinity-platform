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
public class LedgerEntryResponse {

    private UUID id;
    private String entryNumber;
    private String entryType;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String referenceId;
    private UUID transactionId;
    private LocalDateTime createdAt;
}

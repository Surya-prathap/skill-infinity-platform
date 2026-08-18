package com.skillinfinity.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Receipt response details")
public class ReceiptResponse {

    @Schema(description = "Receipt ID")
    private UUID id;

    @Schema(description = "Unique receipt number")
    private String receiptNumber;

    @Schema(description = "Payment ID")
    private UUID paymentId;

    @Schema(description = "Invoice ID")
    private UUID invoiceId;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Amount")
    private BigDecimal amount;

    @Schema(description = "Currency")
    private String currency;

    @Schema(description = "Payment method")
    private String paymentMethod;

    @Schema(description = "Gateway transaction ID")
    private String gatewayTransactionId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Issued at timestamp")
    private LocalDateTime issuedAt;
}

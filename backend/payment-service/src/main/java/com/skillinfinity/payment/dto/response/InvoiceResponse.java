package com.skillinfinity.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Invoice response details")
public class InvoiceResponse {

    @Schema(description = "Invoice ID")
    private UUID id;

    @Schema(description = "Unique invoice number")
    private String invoiceNumber;

    @Schema(description = "Payment ID")
    private UUID paymentId;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Invoice status")
    private String status;

    @Schema(description = "Invoice amount")
    private BigDecimal amount;

    @Schema(description = "Discount amount")
    private BigDecimal discountAmount;

    @Schema(description = "Tax amount")
    private BigDecimal taxAmount;

    @Schema(description = "Total amount")
    private BigDecimal totalAmount;

    @Schema(description = "Currency")
    private String currency;

    @Schema(description = "Description")
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Issued at timestamp")
    private LocalDateTime issuedAt;

    @Schema(description = "Due date")
    private LocalDate dueDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Paid at timestamp")
    private LocalDateTime paidAt;
}

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
@Schema(description = "Payment response details")
public class PaymentResponse {

    @Schema(description = "Payment ID")
    private UUID id;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Unique payment number")
    private String paymentNumber;

    @Schema(description = "Payment status")
    private String status;

    @Schema(description = "Payment amount")
    private BigDecimal amount;

    @Schema(description = "Currency")
    private String currency;

    @Schema(description = "Number of credits")
    private BigDecimal credits;

    @Schema(description = "Discount amount")
    private BigDecimal discountAmount;

    @Schema(description = "Tax amount")
    private BigDecimal taxAmount;

    @Schema(description = "Total amount")
    private BigDecimal totalAmount;

    @Schema(description = "Description")
    private String description;

    @Schema(description = "Reference ID")
    private String referenceId;

    @Schema(description = "Reference type")
    private String referenceType;

    @Schema(description = "Coupon code applied")
    private String couponCode;

    @Schema(description = "Payment gateway used")
    private String gateway;

    @Schema(description = "Gateway payment ID")
    private String gatewayPaymentId;

    @Schema(description = "Gateway order ID")
    private String gatewayOrderId;

    @Schema(description = "Failure reason")
    private String failureReason;

    @Schema(description = "Refunded amount")
    private BigDecimal refundedAmount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Payment timestamp")
    private LocalDateTime paidAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Created at timestamp")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Updated at timestamp")
    private LocalDateTime updatedAt;
}

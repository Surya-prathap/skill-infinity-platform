package com.skillinfinity.wallet.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least 1.00")
    @DecimalMax(value = "1000000.00", message = "Amount must not exceed 1,000,000.00")
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    private String description;

    private String referenceId;

    private String referenceType;

    /**
     * Which bucket the credit lands in: WELCOME, PURCHASED, LEARNING or
     * WITHDRAWABLE. Defaults to PURCHASED when absent (backward compatible
     * with the payment-service purchase event).
     */
    private String creditType;

    private UUID sessionId;

    private UUID mentorId;

    private String paymentGatewayRef;
}

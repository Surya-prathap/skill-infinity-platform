package com.skillinfinity.wallet.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequestDto {

    /** Withdrawable credits to convert into INR. */
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amountCredits;

    /** Optional bank/UPI details for the payout (displayed to admin). */
    private String bankDetails;
}

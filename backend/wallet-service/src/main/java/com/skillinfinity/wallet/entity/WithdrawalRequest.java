package com.skillinfinity.wallet.entity;

import com.skillinfinity.wallet.enumeration.WithdrawalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A mentor's request to convert withdrawable credits into real money.
 *
 * <p>Business rules (configurable via application.yml): 1 withdrawable credit
 * = {@code app.withdrawal.credit-value-inr} (₹10); the platform takes a
 * {@code app.withdrawal.platform-fee-percent} (10%) commission, so the mentor
 * nets 90%. Minimum withdrawal is {@code app.withdrawal.min-credits} (10).
 */
@Entity
@Table(name = "withdrawal_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "amount_credits", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountCredits;

    /** Gross value in INR before platform commission. */
    @Column(name = "gross_amount_inr", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossAmountInr;

    /** Platform commission in INR. */
    @Column(name = "platform_fee_inr", nullable = false, precision = 15, scale = 2)
    private BigDecimal platformFeeInr;

    /** Amount the mentor receives after commission, in INR. */
    @Column(name = "net_amount_inr", nullable = false, precision = 15, scale = 2)
    private BigDecimal netAmountInr;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private WithdrawalStatus status = WithdrawalStatus.PENDING;

    @Column(name = "bank_details", length = 500)
    private String bankDetails;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

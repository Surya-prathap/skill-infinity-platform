package com.skillinfinity.wallet.entity;

import com.skillinfinity.wallet.enumeration.WalletStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "wallet_number", nullable = false, unique = true, length = 20)
    private String walletNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private WalletStatus status = WalletStatus.ACTIVE;

    @Column(name = "total_credits_purchased", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCreditsPurchased = BigDecimal.ZERO;

    @Column(name = "total_credits_spent", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCreditsSpent = BigDecimal.ZERO;

    @Column(name = "total_credits_earned", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCreditsEarned = BigDecimal.ZERO;

    @Column(name = "total_bonus", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalBonus = BigDecimal.ZERO;

    @Column(name = "total_refunds", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalRefunds = BigDecimal.ZERO;

    @Column(name = "frozen_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal frozenAmount = BigDecimal.ZERO;

    @Column(name = "last_transaction_at")
    private LocalDateTime lastTransactionAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        normalizeMoneyFields();
    }

    /**
     * Legacy rows (created before money columns were added, or via raw SQL)
     * can carry NULL money values; JPA nulls them on load and every
     * add()/subtract() would NPE. Normalize to ZERO so reads and writes stay
     * safe regardless of row provenance.
     */
    @PostLoad
    protected void normalizeMoneyFields() {
        totalCreditsPurchased = Optional.ofNullable(totalCreditsPurchased).orElse(BigDecimal.ZERO);
        totalCreditsSpent = Optional.ofNullable(totalCreditsSpent).orElse(BigDecimal.ZERO);
        totalCreditsEarned = Optional.ofNullable(totalCreditsEarned).orElse(BigDecimal.ZERO);
        totalBonus = Optional.ofNullable(totalBonus).orElse(BigDecimal.ZERO);
        totalRefunds = Optional.ofNullable(totalRefunds).orElse(BigDecimal.ZERO);
        frozenAmount = Optional.ofNullable(frozenAmount).orElse(BigDecimal.ZERO);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.skillinfinity.wallet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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

@Entity
@Table(name = "wallet_statistics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "wallet_id", nullable = false, unique = true)
    private Wallet wallet;

    @Column(name = "total_transactions", nullable = false)
    @Builder.Default
    private long totalTransactions = 0;

    @Column(name = "successful_transactions", nullable = false)
    @Builder.Default
    private long successfulTransactions = 0;

    @Column(name = "failed_transactions", nullable = false)
    @Builder.Default
    private long failedTransactions = 0;

    @Column(name = "total_credits_in", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCreditsIn = BigDecimal.ZERO;

    @Column(name = "total_credits_out", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCreditsOut = BigDecimal.ZERO;

    @Column(name = "average_transaction_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal averageTransactionAmount = BigDecimal.ZERO;

    @Column(name = "largest_credit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal largestCredit = BigDecimal.ZERO;

    @Column(name = "largest_debit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal largestDebit = BigDecimal.ZERO;

    @Column(name = "active_days", nullable = false)
    @Builder.Default
    private long activeDays = 0;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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

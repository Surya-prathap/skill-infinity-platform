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
@Table(name = "wallet_balances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "wallet_id", nullable = false, unique = true)
    private Wallet wallet;

    @Column(name = "current_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "available_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Column(name = "frozen_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal frozenBalance = BigDecimal.ZERO;

    @Column(name = "pending_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal pendingBalance = BigDecimal.ZERO;

    /**
     * Credit-type buckets. {@code currentBalance} is the sum of the three
     * learning buckets (welcome + purchased + learning). Withdrawable credits
     * are a separate earning bucket that cannot be spent on learning sessions.
     */
    @Column(name = "welcome_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal welcomeBalance = BigDecimal.ZERO;

    @Column(name = "purchased_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal purchasedBalance = BigDecimal.ZERO;

    @Column(name = "learning_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal learningBalance = BigDecimal.ZERO;

    @Column(name = "withdrawable_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal withdrawableBalance = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "CREDITS";

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

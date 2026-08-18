package com.skillinfinity.payment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Credit package catalog — the ONLY source of truth for how many credits a
 * purchase grants and what it costs in INR. Prices are controlled by the
 * backend/database, never by the frontend.
 *
 * <p>Example: {@code CREDIT_10} → 10 credits for ₹109 (₹10 per credit + GST).</p>
 */
@Entity
@Table(name = "credit_packages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Stable business code, e.g. CREDIT_10, CREDIT_30, CREDIT_60. */
    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "credits", nullable = false, precision = 15, scale = 2)
    private BigDecimal credits;

    /** Price in INR (₹). */
    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

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

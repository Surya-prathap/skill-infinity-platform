package com.skillinfinity.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feature_flags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlag {

    @Id
    private UUID id;

    @Column(name = "feature_key", nullable = false, unique = true, length = 100)
    private String featureKey;

    @Column(name = "feature_name", nullable = false, length = 200)
    private String featureName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "enabled")
    private boolean enabled;

    @Column(name = "rollout_percentage")
    private int rolloutPercentage;

    @Column(name = "environment", length = 50)
    private String environment;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false, updatable = false)
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.active = true;
        this.enabled = false;
        this.rolloutPercentage = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

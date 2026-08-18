package com.skillinfinity.mentor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentor_statistics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorStatistics {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false, unique = true)
    private Mentor mentor;

    @Column(name = "total_sessions", nullable = false)
    private int totalSessions;

    @Column(name = "completed_sessions", nullable = false)
    private int completedSessions;

    @Column(name = "cancelled_sessions", nullable = false)
    private int cancelledSessions;

    @Column(name = "upcoming_sessions", nullable = false)
    private int upcomingSessions;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "total_reviews", nullable = false)
    private int totalReviews;

    @Column(name = "total_students", nullable = false)
    private int totalStudents;

    @Column(name = "total_earnings", precision = 12, scale = 2)
    private BigDecimal totalEarnings;

    @Column(name = "response_rate")
    private Double responseRate;

    @Column(name = "response_time_minutes")
    private Integer responseTimeMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

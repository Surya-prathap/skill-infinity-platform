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
@Table(name = "platform_statistics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatistics {

    @Id
    private UUID id;

    @Column(name = "total_users")
    private long totalUsers;

    @Column(name = "total_mentors")
    private long totalMentors;

    @Column(name = "total_learners")
    private long totalLearners;

    @Column(name = "total_sessions")
    private long totalSessions;

    @Column(name = "total_revenue")
    private double totalRevenue;

    @Column(name = "total_payments")
    private long totalPayments;

    @Column(name = "total_reviews")
    private long totalReviews;

    @Column(name = "total_communities")
    private long totalCommunities;

    @Column(name = "active_users_today")
    private long activeUsersToday;

    @Column(name = "daily_registrations")
    private long dailyRegistrations;

    @Column(name = "completed_sessions")
    private long completedSessions;

    @Column(name = "pending_approvals")
    private long pendingApprovals;

    @Column(name = "open_support_tickets")
    private long openSupportTickets;

    @Column(name = "reported_contents")
    private long reportedContents;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.recordedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

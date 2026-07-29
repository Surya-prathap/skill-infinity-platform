package com.skillinfinity.review.entity;

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
@Table(name = "rating_statistics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingStatistics {

    @Id
    private UUID id;

    @Column(name = "mentor_id", nullable = false, unique = true)
    private UUID mentorId;

    @Column(name = "average_rating")
    private double averageRating;

    @Column(name = "median_rating")
    private double medianRating;

    @Column(name = "total_reviews")
    private int totalReviews;

    @Column(name = "rating_1_count")
    private int rating1Count;

    @Column(name = "rating_2_count")
    private int rating2Count;

    @Column(name = "rating_3_count")
    private int rating3Count;

    @Column(name = "rating_4_count")
    private int rating4Count;

    @Column(name = "rating_5_count")
    private int rating5Count;

    @Column(name = "total_replies")
    private int totalReplies;

    @Column(name = "total_helpful_votes")
    private int totalHelpfulVotes;

    @Column(name = "total_reports")
    private int totalReports;

    @Column(name = "review_growth_rate")
    private double reviewGrowthRate;

    @Column(name = "engagement_score")
    private double engagementScore;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.averageRating = 0.0;
        this.totalReviews = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

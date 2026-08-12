package com.skillinfinity.session.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @Column(name = "learner_id", nullable = false)
    private UUID learnerId;

    @Column(name = "mentor_name", length = 255)
    private String mentorName;

    @Column(name = "learner_name", length = 255)
    private String learnerName;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "status", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private com.skillinfinity.session.enumeration.SessionStatus status;

    @Column(name = "topic", length = 255)
    private String topic;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "is_free", nullable = false)
    private boolean free;

    /**
     * True for free community mentoring sessions (spec: 3 per learner per
     * month). Community sessions cost 0 credits and contribute to the
     * mentor's community recognition rather than the credit economy.
     */
    @Column(name = "is_community", nullable = false)
    @Builder.Default
    private boolean community = false;

    @Column(name = "recording_url", length = 500)
    private String recordingUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "outcome", columnDefinition = "TEXT")
    private String outcome;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_by")
    private UUID cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "booking_id")
    private UUID bookingId;

    @Column(name = "reschedule_count", nullable = false)
    private int rescheduleCount;

    @Column(name = "version")
    @Version
    private Long version;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

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

package com.skillinfinity.session.entity;

import com.skillinfinity.session.enumeration.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @Column(name = "learner_id", nullable = false)
    private UUID learnerId;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "mentor_name", length = 255)
    private String mentorName;

    @Column(name = "learner_name", length = 255)
    private String learnerName;

    /** Learner's email, captured at booking time for reference. */
    @Column(name = "learner_email", length = 255)
    private String learnerEmail;

    @Column(name = "topic", length = 255)
    private String topic;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "preferred_date", nullable = false)
    private LocalDateTime preferredDate;

    @Column(name = "preferred_start_time")
    private LocalDateTime preferredStartTime;

    @Column(name = "preferred_end_time")
    private LocalDateTime preferredEndTime;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    /** Session cost in credits (0 for free/community). */
    @Column(name = "price")
    private double price;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "status", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Column(name = "mentor_message", columnDefinition = "TEXT")
    private String mentorMessage;

    @Column(name = "learner_message", columnDefinition = "TEXT")
    private String learnerMessage;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Version
    @Column(name = "version")
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

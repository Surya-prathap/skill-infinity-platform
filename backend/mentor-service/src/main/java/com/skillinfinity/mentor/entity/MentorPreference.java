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

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentor_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorPreference {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false, unique = true)
    private Mentor mentor;

    @Column(name = "auto_approve_sessions", nullable = false)
    private boolean autoApproveSessions;

    @Column(name = "advance_booking_days")
    private Integer advanceBookingDays;

    @Column(name = "cancellation_hours")
    private Integer cancellationHours;

    @Column(name = "max_students_per_session")
    private Integer maxStudentsPerSession;

    @Column(name = "session_preparation_minutes")
    private Integer sessionPreparationMinutes;

    @Column(name = "buffer_minutes_between_sessions")
    private Integer bufferMinutesBetweenSessions;

    @Column(name = "notification_on_booking", nullable = false)
    private boolean notificationOnBooking;

    @Column(name = "notification_on_cancellation", nullable = false)
    private boolean notificationOnCancellation;

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
        autoApproveSessions = false;
        advanceBookingDays = 30;
        cancellationHours = 24;
        notificationOnBooking = true;
        notificationOnCancellation = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

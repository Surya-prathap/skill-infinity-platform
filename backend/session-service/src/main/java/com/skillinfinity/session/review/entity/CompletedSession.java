package com.skillinfinity.session.review.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "completed_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletedSession {

    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false, unique = true)
    private UUID sessionId;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @Column(name = "learner_id", nullable = false)
    private UUID learnerId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }
}

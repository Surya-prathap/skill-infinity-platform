package com.skillinfinity.session.entity;

import com.skillinfinity.session.enumeration.MeetingProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meeting_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingLink {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "provider", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private MeetingProvider provider;

    @Column(name = "meeting_id", length = 255)
    private String meetingId;

    @Column(name = "meeting_url", length = 500)
    private String meetingUrl;

    @Column(name = "join_url", length = 500)
    private String joinUrl;

    @Column(name = "start_url", length = 500)
    private String startUrl;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "host_key", length = 255)
    private String hostKey;

    @Column(name = "settings", columnDefinition = "TEXT")
    private String settings;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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

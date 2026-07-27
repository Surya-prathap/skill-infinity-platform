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
@Table(name = "timezone_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeZoneConfiguration {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "timezone", nullable = false, length = 50)
    private String timezone;

    @Column(name = "iana_timezone", length = 100)
    private String ianaTimezone;

    @Column(name = "utc_offset", length = 10)
    private String utcOffset;

    @Column(name = "daylight_saving", nullable = false)
    private boolean daylightSaving;

    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage;

    @Column(name = "date_format", length = 20)
    private String dateFormat;

    @Column(name = "time_format", length = 10)
    private String timeFormat;

    @Column(name = "week_start_day", length = 10)
    private String weekStartDay;

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

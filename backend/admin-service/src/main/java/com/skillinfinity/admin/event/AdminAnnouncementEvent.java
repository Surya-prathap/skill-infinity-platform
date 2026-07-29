package com.skillinfinity.admin.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnnouncementEvent {

    private UUID eventId;
    private UUID announcementId;
    private String title;
    private String content;
    private String targetRole;
    private String priority;
    private LocalDateTime timestamp;
    private String source;
}

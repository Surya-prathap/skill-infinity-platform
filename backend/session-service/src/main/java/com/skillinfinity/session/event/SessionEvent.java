package com.skillinfinity.session.event;

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
public class SessionEvent {

    private String eventType;
    private UUID sessionId;
    private UUID mentorId;
    private UUID learnerId;
    private UUID bookingId;
    private String mentorName;
    private String learnerName;
    private String topic;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String timezone;
    private int durationMinutes;
    private String reason;
    private LocalDateTime timestamp;
    private String source;
    private String correlationId;
}

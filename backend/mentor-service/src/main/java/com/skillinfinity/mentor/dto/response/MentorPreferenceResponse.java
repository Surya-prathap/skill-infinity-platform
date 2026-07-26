package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MentorPreferenceResponse {

    private UUID id;
    private boolean autoApproveSessions;
    private Integer advanceBookingDays;
    private Integer cancellationHours;
    private Integer maxStudentsPerSession;
    private Integer sessionPreparationMinutes;
    private Integer bufferMinutesBetweenSessions;
    private boolean notificationOnBooking;
    private boolean notificationOnCancellation;
}

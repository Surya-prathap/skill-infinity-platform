package com.skillinfinity.session.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillinfinity.session.enumeration.SessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Session response")
public class SessionResponse {

    @Schema(description = "Session ID")
    private UUID id;

    @Schema(description = "Session title")
    private String title;

    @Schema(description = "Session description")
    private String description;

    @Schema(description = "Mentor ID")
    private UUID mentorId;

    @Schema(description = "Learner ID")
    private UUID learnerId;

    @Schema(description = "Mentor name")
    private String mentorName;

    @Schema(description = "Learner name")
    private String learnerName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Start time")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "End time")
    private LocalDateTime endTime;

    @Schema(description = "Duration in minutes")
    private int durationMinutes;

    @Schema(description = "Timezone")
    private String timezone;

    @Schema(description = "Session status")
    private SessionStatus status;

    @Schema(description = "Topic")
    private String topic;

    @Schema(description = "Category")
    private String category;

    @Schema(description = "Price")
    private double price;

    @Schema(description = "Currency")
    private String currency;

    @Schema(description = "Whether the session is free")
    private boolean free;

    @Schema(description = "Recording URL")
    private String recordingUrl;

    @Schema(description = "Session notes")
    private String notes;

    @Schema(description = "Session outcome")
    private String outcome;

    @Schema(description = "Rating")
    private Integer rating;

    @Schema(description = "Feedback")
    private String feedback;

    @Schema(description = "Cancellation reason")
    private String cancellationReason;

    @Schema(description = "Reschedule count")
    private int rescheduleCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Completed at")
    private LocalDateTime completedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Started at")
    private LocalDateTime startedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Ended at")
    private LocalDateTime endedAt;

    @Schema(description = "Meeting link")
    private MeetingResponse meetingLink;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;
}

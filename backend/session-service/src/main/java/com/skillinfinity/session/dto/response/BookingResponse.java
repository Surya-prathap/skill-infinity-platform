package com.skillinfinity.session.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillinfinity.session.enumeration.BookingStatus;
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
@Schema(description = "Booking response")
public class BookingResponse {

    @Schema(description = "Booking ID")
    private UUID id;

    @Schema(description = "Mentor ID")
    private UUID mentorId;

    @Schema(description = "Learner ID")
    private UUID learnerId;

    @Schema(description = "Session ID")
    private UUID sessionId;

    @Schema(description = "Mentor name")
    private String mentorName;

    @Schema(description = "Learner name")
    private String learnerName;

    @Schema(description = "Topic")
    private String topic;

    @Schema(description = "Description")
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Preferred date")
    private LocalDateTime preferredDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Preferred start time")
    private LocalDateTime preferredStartTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Preferred end time")
    private LocalDateTime preferredEndTime;

    @Schema(description = "Duration in minutes")
    private int durationMinutes;

    @Schema(description = "Timezone")
    private String timezone;

    @Schema(description = "Booking status")
    private BookingStatus status;

    @Schema(description = "Message from mentor")
    private String mentorMessage;

    @Schema(description = "Message from learner")
    private String learnerMessage;

    @Schema(description = "Rejection reason")
    private String rejectionReason;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Approved at")
    private LocalDateTime approvedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Rejected at")
    private LocalDateTime rejectedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Expires at")
    private LocalDateTime expiresAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;
}

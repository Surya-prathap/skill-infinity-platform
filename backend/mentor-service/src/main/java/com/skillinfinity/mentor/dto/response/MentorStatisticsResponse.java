package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MentorStatisticsResponse {

    private UUID id;
    private int totalSessions;
    private int completedSessions;
    private int cancelledSessions;
    private int upcomingSessions;
    private Double averageRating;
    private int totalReviews;
    private int totalStudents;
    private BigDecimal totalEarnings;
    private Double responseRate;
    private Integer responseTimeMinutes;
}

package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
public class MentorSummaryResponse {

    private UUID id;
    private UUID userId;
    private String status;
    private boolean verified;
    private LocalDateTime createdAt;
    private String headline;
    private String bio;
    private String profilePictureUrl;
    private String country;
    private String city;
    private Integer yearsOfExperience;
    private double averageRating;
    private int totalReviews;
    private int totalSessions;
    private int totalStudents;
    private int profileCompletionPercentage;
}

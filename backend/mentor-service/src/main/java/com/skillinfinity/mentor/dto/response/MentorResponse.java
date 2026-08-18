package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MentorResponse {

    private UUID id;
    private UUID userId;
    private String status;
    private boolean verified;
    private LocalDateTime verifiedAt;
    private MentorProfileResponse profile;
    private List<ExpertiseResponse> expertiseList;
    private List<AvailabilityResponse> availabilities;
    private List<PricingResponse> pricingList;
    private List<LanguageResponse> languages;
    private List<ExperienceResponse> experiences;
    private List<EducationResponse> educationList;
    private List<SocialProfileResponse> socialProfiles;
    private MentorPreferenceResponse preference;
    private MentorStatisticsResponse statistics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.skillinfinity.user.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileResponse {

    private UUID id;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String headline;
    private String bio;
    private String phone;
    private LocalDate dateOfBirth;
    private String country;
    private String city;
    private String address;
    private String timezone;
    private String profilePictureUrl;
    private String resumeUrl;
    private String website;
    private String linkedinUrl;
    private String githubUrl;
    private String twitterUrl;
    private int profileCompletionPercentage;
    private List<EducationResponse> educations;
    private List<ExperienceResponse> experiences;
    private List<SkillResponse> skills;
    private List<LanguageResponse> languages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

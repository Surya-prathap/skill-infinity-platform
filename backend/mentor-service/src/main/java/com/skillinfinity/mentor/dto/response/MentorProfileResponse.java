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
public class MentorProfileResponse {

    private UUID id;
    private String bio;
    private String headline;
    private String aboutMe;
    private String profilePictureUrl;
    private String coverImageUrl;
    private String country;
    private String city;
    private String timezone;
    private String phone;
    private String website;
    private Integer yearsOfExperience;
    private String teachingLevel;
    private int profileCompletionPercentage;
    private boolean profileVisible;
    private boolean acceptingStudents;
    private Integer maxStudents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.skillinfinity.mentor.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMentorProfileRequest {

    @Size(max = 200, message = "Headline must not exceed 200 characters")
    private String headline;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    @Size(max = 5000, message = "About me must not exceed 5000 characters")
    private String aboutMe;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    private String profilePictureUrl;

    @Size(max = 500, message = "Cover image URL must not exceed 500 characters")
    private String coverImageUrl;

    @Size(max = 50, message = "Country must not exceed 50 characters")
    private String country;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 500, message = "Website must not exceed 500 characters")
    private String website;

    private Integer yearsOfExperience;

    @Size(max = 30, message = "Teaching level must not exceed 30 characters")
    private String teachingLevel;

    private Boolean profileVisible;

    private Boolean acceptingStudents;

    private Integer maxStudents;
}

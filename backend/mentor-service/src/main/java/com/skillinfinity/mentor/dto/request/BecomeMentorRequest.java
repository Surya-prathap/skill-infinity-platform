package com.skillinfinity.mentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BecomeMentorRequest {

    @NotBlank(message = "Headline is required")
    @Size(max = 200, message = "Headline must not exceed 200 characters")
    private String headline;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    @Size(max = 5000, message = "About me must not exceed 5000 characters")
    private String aboutMe;

    @Size(max = 50, message = "Country must not exceed 50 characters")
    private String country;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;

    private Integer yearsOfExperience;
}

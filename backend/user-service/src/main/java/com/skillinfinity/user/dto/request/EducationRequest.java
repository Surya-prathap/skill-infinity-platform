package com.skillinfinity.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationRequest {

    @NotBlank(message = "Institution is required")
    @Size(max = 200)
    private String institution;

    @Size(max = 200)
    private String degree;

    @Size(max = 200)
    private String fieldOfStudy;

    private LocalDate startDate;
    private LocalDate endDate;
    private boolean currentlyStudying;

    @Size(max = 2000)
    private String description;

    @Size(max = 50)
    private String grade;

    private int sortOrder;
}

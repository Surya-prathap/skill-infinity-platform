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
public class ExperienceRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 200)
    private String company;

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 200)
    private String location;

    @Size(max = 50)
    private String employmentType;

    private LocalDate startDate;
    private LocalDate endDate;
    private boolean currentlyWorking;

    @Size(max = 2000)
    private String description;

    private int sortOrder;
}

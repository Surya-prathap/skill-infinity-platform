package com.skillinfinity.mentor.dto.request;

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
public class AchievementRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 50, message = "Type must not exceed 50 characters")
    private String type;

    private LocalDate dateAchieved;

    @Size(max = 200, message = "Issuer must not exceed 200 characters")
    private String issuer;

    @Size(max = 500, message = "URL must not exceed 500 characters")
    private String url;

    private int sortOrder;
}

package com.skillinfinity.user.dto.request;

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
public class SkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String proficiencyLevel;

    private Integer yearsOfExperience;

    private int sortOrder;
}

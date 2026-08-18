package com.skillinfinity.mentor.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpertiseRequest {

    private UUID categoryId;

    private UUID subCategoryId;

    private UUID skillId;

    @Size(max = 100, message = "Custom skill name must not exceed 100 characters")
    private String customSkillName;

    private Integer yearsOfExperience;

    @Size(max = 30, message = "Teaching level must not exceed 30 characters")
    private String teachingLevel;

    @Size(max = 30, message = "Proficiency level must not exceed 30 characters")
    private String proficiencyLevel;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 500, message = "Learning domains must not exceed 500 characters")
    private String learningDomains;

    @Size(max = 500, message = "Technologies must not exceed 500 characters")
    private String technologies;

    private int displayOrder;
}

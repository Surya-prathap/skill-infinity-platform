package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExpertiseResponse {

    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private UUID subCategoryId;
    private String subCategoryName;
    private UUID skillId;
    private String skillName;
    private String customSkillName;
    private Integer yearsOfExperience;
    private String teachingLevel;
    private String proficiencyLevel;
    private String description;
    private String learningDomains;
    private String technologies;
    private int displayOrder;
}

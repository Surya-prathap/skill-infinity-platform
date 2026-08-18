package com.skillinfinity.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillResponse {

    private UUID id;
    private String name;
    private String proficiencyLevel;
    private Integer yearsOfExperience;
    private int sortOrder;
}

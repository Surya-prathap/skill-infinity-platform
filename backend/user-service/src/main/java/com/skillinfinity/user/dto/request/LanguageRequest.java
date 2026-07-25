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
public class LanguageRequest {

    @NotBlank(message = "Language name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Proficiency level is required")
    @Size(max = 50)
    private String proficiencyLevel;

    private boolean isNative;

    private int sortOrder;
}

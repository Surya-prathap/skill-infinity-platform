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
public class LanguageResponse {

    private UUID id;
    private String name;
    private String proficiencyLevel;
    private boolean isNative;
    private int sortOrder;
}

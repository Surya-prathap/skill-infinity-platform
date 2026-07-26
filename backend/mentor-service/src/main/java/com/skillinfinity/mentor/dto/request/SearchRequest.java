package com.skillinfinity.mentor.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    private String keyword;
    private List<String> skills;
    private List<String> categories;
    private List<String> subcategories;
    private Integer minExperience;
    private Integer maxExperience;
    private List<String> languages;
    private BigDecimal maxPrice;
    private String country;
    private String timezone;
    private String sortBy;
    private String sortDirection;
}

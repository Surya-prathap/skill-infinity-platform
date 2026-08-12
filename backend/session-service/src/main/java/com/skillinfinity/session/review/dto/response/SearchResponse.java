package com.skillinfinity.session.review.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Search result response")
public class SearchResponse {

    @Schema(description = "Search query")
    private String query;

    @Schema(description = "Search results")
    private List<ReviewResponse> results;

    @Schema(description = "Total results")
    private long totalResults;

    @Schema(description = "Current page")
    private int page;

    @Schema(description = "Page size")
    private int size;

    @Schema(description = "Filter criteria")
    private SearchFilter filter;

    @Schema(description = "Sort field")
    private String sortBy;

    @Schema(description = "Sort direction")
    private String sortDirection;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Search filter criteria")
    public static class SearchFilter {

        @Schema(description = "Mentor ID filter")
        private UUID mentorId;

        @Schema(description = "Minimum rating filter")
        private Integer minRating;

        @Schema(description = "Maximum rating filter")
        private Integer maxRating;

        @Schema(description = "Status filter")
        private String status;

        @Schema(description = "Date range start")
        private String dateFrom;

        @Schema(description = "Date range end")
        private String dateTo;
    }
}

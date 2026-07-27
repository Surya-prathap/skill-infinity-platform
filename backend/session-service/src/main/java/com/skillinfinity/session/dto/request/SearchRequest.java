package com.skillinfinity.session.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Search request for sessions")
public class SearchRequest {

    @Schema(description = "Search keyword", example = "Java")
    private String keyword;

    @Schema(description = "Mentor ID to filter by")
    private UUID mentorId;

    @Schema(description = "Learner ID to filter by")
    private UUID learnerId;

    @Schema(description = "Status to filter by", example = "SCHEDULED")
    private String status;

    @Schema(description = "Category to filter by", example = "Technology")
    private String category;

    @Schema(description = "Start date range (from)", example = "2026-08-01T00:00:00")
    private LocalDateTime dateFrom;

    @Schema(description = "Start date range (to)", example = "2026-08-31T23:59:59")
    private LocalDateTime dateTo;

    @Schema(description = "Minimum price", example = "0")
    private Double minPrice;

    @Schema(description = "Maximum price", example = "500")
    private Double maxPrice;

    @Schema(description = "Whether to search free sessions only", example = "false")
    private Boolean freeOnly;

    @Schema(description = "Sort field", example = "startTime", allowableValues = {"startTime", "createdAt", "price"})
    private String sortBy;

    @Schema(description = "Sort direction", example = "DESC", allowableValues = {"ASC", "DESC"})
    private String sortDirection;
}

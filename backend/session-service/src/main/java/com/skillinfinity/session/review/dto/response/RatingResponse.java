package com.skillinfinity.session.review.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Rating summary response")
public class RatingResponse {

    @Schema(description = "Mentor ID")
    private UUID mentorId;

    @Schema(description = "Average rating")
    private double averageRating;

    @Schema(description = "Total number of reviews")
    private int totalReviews;

    @Schema(description = "Rating breakdown (1-5 stars)")
    private Map<Integer, Long> ratingBreakdown;

    @Schema(description = "Percentage breakdown of ratings")
    private Map<Integer, Double> ratingPercentageBreakdown;

    @Schema(description = "5-star percentage")
    private double fiveStarPercentage;

    @Schema(description = "4-star percentage")
    private double fourStarPercentage;

    @Schema(description = "3-star percentage")
    private double threeStarPercentage;

    @Schema(description = "2-star percentage")
    private double twoStarPercentage;

    @Schema(description = "1-star percentage")
    private double oneStarPercentage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Rating statistics response")
    public static class RatingStatisticsResponse {

        @Schema(description = "Mentor ID")
        private UUID mentorId;

        @Schema(description = "Average rating")
        private double averageRating;

        @Schema(description = "Total reviews")
        private int totalReviews;
    }
}

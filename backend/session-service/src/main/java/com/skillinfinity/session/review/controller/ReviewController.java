package com.skillinfinity.session.review.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.session.review.dto.request.ReviewRequest;
import com.skillinfinity.session.review.dto.response.RatingResponse;
import com.skillinfinity.session.review.dto.response.ReviewResponse;
import com.skillinfinity.session.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Ratings and reviews for completed mentoring sessions")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create review", description = "Creates a review (rating + comment) for a completed mentoring session")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ReviewResponse response = reviewService.createReview(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created", response));
    }

    @GetMapping
    @Operation(summary = "Get reviews by mentor", description = "Returns paginated approved reviews for a mentor")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviewsByMentor(
            @RequestParam UUID mentorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReviewResponse> reviews = reviewService.getReviewsByMentor(mentorId, page, size);
        PageResponse<ReviewResponse> pageResponse = PageResponse.of(
                reviews.getContent(), reviews.getNumber(),
                reviews.getSize(), reviews.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID", description = "Returns review details by its unique ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReview(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReview(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update review", description = "Updates an existing review. Only the review author can update.")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ReviewResponse response = reviewService.updateReview(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Review updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete review", description = "Soft-deletes a review. Only the review author can delete.")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        reviewService.deleteReview(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get review statistics", description = "Returns rating statistics for a mentor")
    public ResponseEntity<ApiResponse<RatingResponse.RatingStatisticsResponse>> getReviewStatistics(
            @RequestParam UUID mentorId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getMentorRatingStatistics(mentorId)));
    }

    @GetMapping("/average-rating")
    @Operation(summary = "Get average rating", description = "Returns the average rating for a mentor")
    public ResponseEntity<ApiResponse<RatingResponse>> getAverageRating(@RequestParam UUID mentorId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAverageRating(mentorId)));
    }

    @GetMapping("/rating-breakdown")
    @Operation(summary = "Get rating breakdown", description = "Returns the rating breakdown (1-5 stars) for a mentor")
    public ResponseEntity<ApiResponse<RatingResponse>> getRatingBreakdown(@RequestParam UUID mentorId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getRatingBreakdown(mentorId)));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent reviews", description = "Returns the most recent reviews for a mentor")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getRecentReviews(
            @RequestParam UUID mentorId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getRecentReviews(mentorId, limit)));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get session reviews", description = "Returns all reviews for a specific session")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getSessionReviews(
            @PathVariable UUID sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReviewResponse> reviews = reviewService.getSessionReviews(sessionId, page, size);
        PageResponse<ReviewResponse> pageResponse = PageResponse.of(
                reviews.getContent(), reviews.getNumber(),
                reviews.getSize(), reviews.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    private UUID extractUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new com.skillinfinity.common.exception.UnauthorizedException("User not authenticated");
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            throw new com.skillinfinity.common.exception.UnauthorizedException("Invalid user identifier");
        }
    }
}

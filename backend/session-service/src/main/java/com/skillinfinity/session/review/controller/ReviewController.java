package com.skillinfinity.session.review.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.session.review.dto.request.ReplyRequest;
import com.skillinfinity.session.review.dto.request.ReportRequest;
import com.skillinfinity.session.review.dto.request.ReviewRequest;
import com.skillinfinity.session.review.dto.request.VoteRequest;
import com.skillinfinity.session.review.dto.response.RatingResponse;
import com.skillinfinity.session.review.dto.response.ReviewResponse;
import com.skillinfinity.session.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@Tag(name = "Reviews", description = "Review management, ratings, voting, reporting, and analytics")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create review", description = "Creates a new review for a completed mentoring session. Only learners who completed the session can submit reviews.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Review created successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(value = "{\"success\":true,\"message\":\"Review created\",\"data\":{\"id\":\"uuid\",\"rating\":4,\"content\":\"Great session!\"}}"))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or duplicate review"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        log.info("Creating review for session: {} by user: {}", request.getSessionId(), userId);
        ReviewResponse response = reviewService.createReview(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created", response));
    }

    @GetMapping
    @Operation(summary = "Get reviews by mentor", description = "Returns paginated approved reviews for a mentor with optional rating filter")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviewsByMentor(
            @RequestParam UUID mentorId,
            @RequestParam(required = false) Integer rating,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<ReviewResponse> reviews;
        if (rating != null && rating >= 1 && rating <= 5) {
            reviews = reviewService.getReviewsByMentor(mentorId, page, size, userId);
        } else {
            reviews = reviewService.getReviewsByMentor(mentorId, page, size, userId);
        }
        PageResponse<ReviewResponse> pageResponse = PageResponse.of(
                reviews.getContent(), reviews.getNumber(),
                reviews.getSize(), reviews.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID", description = "Returns review details by its unique ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReview(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ReviewResponse response = reviewService.getReview(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
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

    @PostMapping("/reply")
    @Operation(summary = "Reply to review", description = "Allows a mentor to reply to a review about their mentoring session")
    public ResponseEntity<ApiResponse<ReviewResponse>> replyToReview(
            @Valid @RequestBody ReplyRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ReviewResponse response = reviewService.replyToReview(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Reply added", response));
    }

    @PostMapping("/vote")
    @Operation(summary = "Vote review", description = "Vote a review as HELPFUL or NOT_HELPFUL. Toggles if vote type changes.")
    public ResponseEntity<ApiResponse<Void>> voteReview(
            @Valid @RequestBody VoteRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        reviewService.voteReview(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Vote recorded", null));
    }

    @PostMapping("/report")
    @Operation(summary = "Report review", description = "Report a review for inappropriate content or policy violations")
    public ResponseEntity<ApiResponse<Void>> reportReview(
            @Valid @RequestBody ReportRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        reviewService.reportReview(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Review reported", null));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get review statistics", description = "Returns rating statistics and analytics for a mentor")
    public ResponseEntity<ApiResponse<RatingResponse.RatingStatisticsResponse>> getReviewStatistics(
            @RequestParam UUID mentorId) {
        RatingResponse.RatingStatisticsResponse stats = reviewService.getMentorRatingStatistics(mentorId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/average-rating")
    @Operation(summary = "Get average rating", description = "Returns the average rating for a mentor")
    public ResponseEntity<ApiResponse<RatingResponse>> getAverageRating(
            @RequestParam UUID mentorId) {
        RatingResponse response = reviewService.getAverageRating(mentorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rating-breakdown")
    @Operation(summary = "Get rating breakdown", description = "Returns the rating breakdown (1-5 stars) for a mentor")
    public ResponseEntity<ApiResponse<RatingResponse>> getRatingBreakdown(
            @RequestParam UUID mentorId) {
        RatingResponse response = reviewService.getRatingBreakdown(mentorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent reviews", description = "Returns the most recent reviews for a mentor")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getRecentReviews(
            @RequestParam UUID mentorId,
            @RequestParam(defaultValue = "10") int limit) {
        List<ReviewResponse> reviews = reviewService.getRecentReviews(mentorId, limit);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated mentors", description = "Returns the top rated mentors based on average rating")
    public ResponseEntity<ApiResponse<List<RatingResponse.TopMentorResponse>>> getTopRatedMentors(
            @RequestParam(defaultValue = "10") int limit) {
        List<RatingResponse.TopMentorResponse> mentors = reviewService.getTopRatedMentors(limit);
        return ResponseEntity.ok(ApiResponse.success(mentors));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get session reviews", description = "Returns all reviews for a specific session")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getSessionReviews(
            @PathVariable UUID sessionId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<ReviewResponse> reviews = reviewService.getSessionReviews(sessionId, page, size, userId);
        PageResponse<ReviewResponse> pageResponse = PageResponse.of(
                reviews.getContent(), reviews.getNumber(),
                reviews.getSize(), reviews.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/search")
    @Operation(summary = "Search reviews", description = "Search reviews by keyword in title or content")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> searchReviews(
            @RequestParam String query,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<ReviewResponse> reviews = reviewService.searchReviews(query, page, size, userId);
        PageResponse<ReviewResponse> pageResponse = PageResponse.of(
                reviews.getContent(), reviews.getNumber(),
                reviews.getSize(), reviews.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PutMapping("/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Moderate review", description = "Admin endpoint to approve, reject, or flag a review")
    public ResponseEntity<ApiResponse<Void>> moderateReview(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String reason,
            Principal principal) {
        UUID adminId = extractUserId(principal);
        reviewService.moderateReview(id, status, reason, adminId);
        return ResponseEntity.ok(ApiResponse.success("Review moderated", null));
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

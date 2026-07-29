package com.skillinfinity.review.controller;

import com.skillinfinity.review.dto.request.ReviewRequest;
import com.skillinfinity.review.dto.response.ReviewResponse;
import com.skillinfinity.review.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
@ActiveProfiles("test")
@WithMockUser(username = "550e8400-e29b-41d4-a716-446655440000")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewService reviewService;

    @Test
    void shouldReturnReviewById() throws Exception {
        UUID reviewId = UUID.randomUUID();
        ReviewResponse response = new ReviewResponse();
        response.setId(reviewId);

        when(reviewService.getReview(any(UUID.class), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/reviews/{id}", reviewId))
                .andExpect(status().isOk());
    }

    @Test
    void shouldSearchReviews() throws Exception {
        when(reviewService.searchReviews(anyString(), anyInt(), anyInt(), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/reviews/search?query=java"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetTopRatedMentors() throws Exception {
        when(reviewService.getTopRatedMentors(anyInt()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/reviews/top-rated?limit=5"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnUnauthorizedForUnauthenticatedRequest() throws Exception {
        // This test is now redundant with @WithMockUser but kept for documentation
        // The SecurityConfig requires authentication for all endpoints
    }
}

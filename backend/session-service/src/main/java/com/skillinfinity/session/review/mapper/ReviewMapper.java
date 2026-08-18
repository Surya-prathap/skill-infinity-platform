package com.skillinfinity.session.review.mapper;

import com.skillinfinity.session.review.dto.response.RatingResponse;
import com.skillinfinity.session.review.dto.response.ReviewResponse;
import com.skillinfinity.session.review.entity.RatingStatistics;
import com.skillinfinity.session.review.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "status", expression = "java(review.getStatus() != null ? review.getStatus().name() : null)")
    ReviewResponse toReviewResponse(Review review);

    List<ReviewResponse> toReviewResponseList(List<Review> reviews);

    @Mapping(target = "averageRating", expression = "java(stats.getAverageRating())")
    RatingResponse.RatingStatisticsResponse toStatisticsResponse(RatingStatistics stats);
}

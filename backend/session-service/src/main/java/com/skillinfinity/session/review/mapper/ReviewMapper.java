package com.skillinfinity.session.review.mapper;

import com.skillinfinity.session.review.dto.response.RatingResponse;
import com.skillinfinity.session.review.dto.response.ReviewResponse;
import com.skillinfinity.session.review.entity.MentorRating;
import com.skillinfinity.session.review.entity.RatingStatistics;
import com.skillinfinity.session.review.entity.Review;
import com.skillinfinity.session.review.entity.ReviewReply;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "status", expression = "java(review.getStatus() != null ? review.getStatus().name() : null)")
    @Mapping(target = "replies", source = "replies", qualifiedByName = "toReplyResponseList")
    ReviewResponse toReviewResponse(Review review);

    List<ReviewResponse> toReviewResponseList(List<Review> reviews);

    @Named("toReplyResponse")
    @Mapping(target = "id", source = "reply.id")
    @Mapping(target = "mentorId", source = "reply.mentorId")
    @Mapping(target = "content", source = "reply.content")
    @Mapping(target = "createdAt", source = "reply.createdAt")
    @Mapping(target = "updatedAt", source = "reply.updatedAt")
    ReviewResponse.ReplyResponse toReplyResponse(ReviewReply reply);

    @Named("toReplyResponseList")
    List<ReviewResponse.ReplyResponse> toReplyResponseList(List<ReviewReply> replies);

    @Mapping(target = "averageRating", expression = "java(mentorRating.getAverageRating())")
    RatingResponse toRatingResponse(MentorRating mentorRating);

    @Mapping(target = "averageRating", expression = "java(stats.getAverageRating())")
    RatingResponse.RatingStatisticsResponse toStatisticsResponse(RatingStatistics stats);
}

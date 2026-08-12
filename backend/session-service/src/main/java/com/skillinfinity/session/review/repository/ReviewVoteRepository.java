package com.skillinfinity.session.review.repository;

import com.skillinfinity.session.review.entity.ReviewVote;
import com.skillinfinity.session.review.enumeration.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewVoteRepository extends JpaRepository<ReviewVote, UUID> {

    Optional<ReviewVote> findByReviewIdAndUserIdAndActiveTrue(UUID reviewId, UUID userId);

    boolean existsByReviewIdAndUserIdAndActiveTrue(UUID reviewId, UUID userId);

    long countByReviewIdAndVoteTypeAndActiveTrue(UUID reviewId, VoteType voteType);

    boolean existsByReviewIdAndUserIdAndVoteTypeAndActiveTrue(UUID reviewId, UUID userId, VoteType voteType);
}

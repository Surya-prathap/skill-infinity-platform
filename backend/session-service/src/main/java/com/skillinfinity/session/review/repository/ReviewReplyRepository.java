package com.skillinfinity.session.review.repository;

import com.skillinfinity.session.review.entity.ReviewReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, UUID> {

    Page<ReviewReply> findByReviewIdAndActiveTrueOrderByCreatedAtAsc(UUID reviewId, Pageable pageable);

    Optional<ReviewReply> findByIdAndActiveTrue(UUID id);

    boolean existsByReviewIdAndMentorIdAndActiveTrue(UUID reviewId, UUID mentorId);

    long countByReviewIdAndActiveTrue(UUID reviewId);
}

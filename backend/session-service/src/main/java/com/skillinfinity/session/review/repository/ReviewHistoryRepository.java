package com.skillinfinity.session.review.repository;

import com.skillinfinity.session.review.entity.ReviewHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, UUID> {

    Page<ReviewHistory> findByReviewIdOrderByCreatedAtDesc(UUID reviewId, Pageable pageable);
}

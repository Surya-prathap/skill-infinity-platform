package com.skillinfinity.review.repository;

import com.skillinfinity.review.entity.ReviewReport;
import com.skillinfinity.review.enumeration.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, UUID> {

    Page<ReviewReport> findByReviewIdAndActiveTrue(UUID reviewId, Pageable pageable);

    Page<ReviewReport> findByStatusAndActiveTrue(ReportStatus status, Pageable pageable);

    boolean existsByReviewIdAndReporterIdAndActiveTrue(UUID reviewId, UUID reporterId);

    long countByReviewIdAndActiveTrue(UUID reviewId);
}

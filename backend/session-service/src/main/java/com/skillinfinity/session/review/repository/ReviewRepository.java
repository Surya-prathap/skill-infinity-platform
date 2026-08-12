package com.skillinfinity.session.review.repository;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.session.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findByIdAndActiveTrue(UUID id);

    Page<Review> findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
            UUID mentorId, ReviewStatus status, Pageable pageable);

    Page<Review> findByLearnerIdAndActiveTrueOrderByCreatedAtDesc(UUID learnerId, Pageable pageable);

    Page<Review> findBySessionIdAndActiveTrueOrderByCreatedAtDesc(UUID sessionId, Pageable pageable);

    boolean existsBySessionIdAndLearnerIdAndActiveTrue(UUID sessionId, UUID learnerId);

    @Query("SELECT r FROM Review r WHERE r.active = true AND r.status = 'APPROVED' AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Review> searchReviews(@Param("query") String query, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.mentorId = :mentorId AND r.active = true " +
           "AND r.status = 'APPROVED' ORDER BY r.createdAt DESC")
    List<Review> findRecentReviewsByMentorId(@Param("mentorId") UUID mentorId, Pageable pageable);

    @Query("SELECT r.mentorId, AVG(r.rating) as avgRating, COUNT(r) as reviewCount " +
           "FROM Review r WHERE r.active = true AND r.status = 'APPROVED' " +
           "GROUP BY r.mentorId ORDER BY avgRating DESC")
    List<Object[]> findTopRatedMentors(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.mentorId = :mentorId " +
           "AND r.active = true AND r.status = 'APPROVED'")
    Double findAverageRatingByMentorId(@Param("mentorId") UUID mentorId);

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.mentorId = :mentorId " +
           "AND r.active = true AND r.status = 'APPROVED' GROUP BY r.rating ORDER BY r.rating")
    List<Object[]> findRatingBreakdownByMentorId(@Param("mentorId") UUID mentorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.mentorId = :mentorId " +
           "AND r.active = true AND r.status = 'APPROVED'")
    long countByMentorId(@Param("mentorId") UUID mentorId);

    @Query("SELECT r FROM Review r WHERE r.active = true AND r.status = 'APPROVED' " +
           "AND r.createdAt >= :since ORDER BY r.createdAt DESC")
    List<Review> findReviewsSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.active = true AND r.status = 'APPROVED' " +
           "AND r.rating >= :minRating AND r.rating <= :maxRating")
    long countByRatingRange(@Param("minRating") int minRating, @Param("maxRating") int maxRating);

    @Query("SELECT r FROM Review r WHERE r.mentorId = :mentorId AND r.active = true " +
           "AND r.status = 'APPROVED' AND r.rating = :rating ORDER BY r.createdAt DESC")
    Page<Review> findByMentorIdAndRating(@Param("mentorId") UUID mentorId,
                                          @Param("rating") int rating, Pageable pageable);

    List<Review> findByActiveTrueAndStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);

    long countByActiveTrueAndStatusAndCreatedAtBetween(
            ReviewStatus status, LocalDateTime start, LocalDateTime end);

    long countByStatusAndActiveTrue(ReviewStatus status);

    @Query("SELECT COUNT(DISTINCT r.id) FROM Review r WHERE r.active = true " +
           "AND r.status = 'APPROVED' AND r.reportCount > 0")
    long countReportedReviews();

    @Query("SELECT COUNT(r) FROM Review r WHERE r.learnerId = :learnerId " +
           "AND r.active = true AND r.createdAt >= :since")
    long countByLearnerIdSince(@Param("learnerId") UUID learnerId,
                                @Param("since") LocalDateTime since);
}

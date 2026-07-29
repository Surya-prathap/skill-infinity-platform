package com.skillinfinity.review.repository;

import com.skillinfinity.review.entity.RatingStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingStatisticsRepository extends JpaRepository<RatingStatistics, UUID> {

    Optional<RatingStatistics> findByMentorId(UUID mentorId);
}

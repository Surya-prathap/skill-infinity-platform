package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.PlatformStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformStatisticsRepository extends JpaRepository<PlatformStatistics, UUID> {

    Optional<PlatformStatistics> findTopByOrderByRecordedAtDesc();

    Optional<PlatformStatistics> findByRecordedAtBetween(LocalDateTime start, LocalDateTime end);
}

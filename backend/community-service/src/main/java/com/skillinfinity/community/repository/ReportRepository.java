package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Report;
import com.skillinfinity.community.enumeration.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    Page<Report> findByStatusAndActiveTrue(ReportStatus status, Pageable pageable);

    Page<Report> findByReporterIdAndActiveTrue(UUID reporterId, Pageable pageable);

    long countByTargetIdAndActiveTrue(UUID targetId);

    long countByStatusAndActiveTrue(ReportStatus status);

    org.springframework.data.domain.Page<Report> findByActiveTrueOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
}

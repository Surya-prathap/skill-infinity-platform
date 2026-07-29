package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.ReportedContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportedContentRepository extends JpaRepository<ReportedContent, UUID> {

    Page<ReportedContent> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<ReportedContent> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(String status);
}

package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.SystemAnnouncement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, UUID> {

    Page<SystemAnnouncement> findByTargetRoleAndActiveTrueOrderByCreatedAtDesc(String targetRole, Pageable pageable);

    Page<SystemAnnouncement> findByStatusAndActiveTrue(String status, Pageable pageable);

    List<SystemAnnouncement> findByScheduledAtBeforeAndStatusAndActiveTrue(LocalDateTime now, String status);

    Page<SystemAnnouncement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

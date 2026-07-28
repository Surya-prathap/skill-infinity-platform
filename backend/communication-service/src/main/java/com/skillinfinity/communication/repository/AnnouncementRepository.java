package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.Announcement;
import com.skillinfinity.communication.enumeration.AnnouncementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    Page<Announcement> findByStatusAndActiveTrueOrderByCreatedAtDesc(AnnouncementStatus status, Pageable pageable);

    Page<Announcement> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM Announcement a WHERE a.status = :status AND a.scheduledAt <= :now AND a.active = true")
    List<Announcement> findScheduledAnnouncementsReadyToPublish(@Param("status") AnnouncementStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Announcement a WHERE a.important = true AND a.active = true AND a.status = 'PUBLISHED' ORDER BY a.publishedAt DESC")
    List<Announcement> findImportantAnnouncements();
}

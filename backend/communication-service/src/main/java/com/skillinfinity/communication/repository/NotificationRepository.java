package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserIdAndActiveTrueOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Notification> findByUserIdAndActiveTrueOrderByCreatedAtDesc(UUID userId);

    Optional<Notification> findByIdAndUserIdAndActiveTrue(UUID id, UUID userId);

    long countByUserIdAndReadFalseAndActiveTrue(UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.userId = :userId AND n.read = false AND n.active = true")
    int markAllAsRead(@Param("userId") UUID userId, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.id IN :ids AND n.userId = :userId AND n.active = true")
    int markSelectedAsRead(@Param("ids") List<UUID> ids, @Param("userId") UUID userId, @Param("readAt") LocalDateTime readAt);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.sent = false AND n.active = true")
    List<Notification> findUnsentNotificationsByUserId(@Param("userId") UUID userId);

    List<Notification> findByUserIdAndSentFalseAndActiveTrue(UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}

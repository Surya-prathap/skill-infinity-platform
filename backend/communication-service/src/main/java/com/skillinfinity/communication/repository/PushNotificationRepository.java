package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.PushNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PushNotificationRepository extends JpaRepository<PushNotification, UUID> {

    List<PushNotification> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);

    List<PushNotification> findByStatus(String status);
}

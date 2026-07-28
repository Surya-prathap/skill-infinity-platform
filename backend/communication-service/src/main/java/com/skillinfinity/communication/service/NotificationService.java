package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.request.NotificationRequest;
import com.skillinfinity.communication.dto.response.NotificationResponse;
import com.skillinfinity.communication.enumeration.NotificationCategory;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    NotificationResponse createNotification(NotificationRequest request);

    NotificationResponse createInAppNotification(UUID userId, String title, String body, NotificationCategory category);

    Page<NotificationResponse> getNotifications(UUID userId, int page, int size);

    long getUnreadNotificationCount(UUID userId);

    void markAsRead(UUID userId, List<UUID> notificationIds);

    void markAllAsRead(UUID userId);

    void deleteNotification(UUID notificationId, UUID userId);
}

package com.skillinfinity.communication.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.communication.dto.request.NotificationRequest;
import com.skillinfinity.communication.dto.response.NotificationResponse;
import com.skillinfinity.communication.entity.Notification;
import com.skillinfinity.communication.enumeration.NotificationCategory;
import com.skillinfinity.communication.enumeration.NotificationChannel;
import com.skillinfinity.communication.event.CommunicationEventPublisher;
import com.skillinfinity.communication.event.NotificationSentEvent;
import com.skillinfinity.communication.exception.NotificationNotFoundException;
import com.skillinfinity.communication.mapper.CommunicationMapper;
import com.skillinfinity.communication.repository.NotificationRepository;
import com.skillinfinity.communication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final CommunicationMapper mapper;
    private final CommunicationEventPublisher eventPublisher;

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());

        NotificationCategory category;
        try {
            category = NotificationCategory.valueOf(request.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid notification category: " + request.getCategory());
        }

        NotificationChannel channel = NotificationChannel.IN_APP;
        if (request.getChannel() != null) {
            try {
                channel = NotificationChannel.valueOf(request.getChannel().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid notification channel: " + request.getChannel());
            }
        }

        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(request.getUserId())
                .title(request.getTitle())
                .body(request.getBody())
                .category(category)
                .channel(channel)
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .sent(true)
                .sentAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        eventPublisher.publishNotificationSent(new NotificationSentEvent(
                notification.getId(), notification.getUserId(),
                channel.name(), category.name(), notification.getTitle()
        ));

        return mapper.toNotificationResponse(notification);
    }

    @Override
    public NotificationResponse createInAppNotification(UUID userId, String title, String body, NotificationCategory category) {
        log.debug("Creating in-app notification for user: {} category: {}", userId, category);

        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .title(title)
                .body(body)
                .category(category)
                .channel(NotificationChannel.IN_APP)
                .sent(true)
                .sentAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        return mapper.toNotificationResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "notificationCount", key = "#userId")
    public long getUnreadNotificationCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalseAndActiveTrue(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        log.debug("Fetching notifications for user: {}", userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(mapper::toNotificationResponse);
    }

    @Override
    @CacheEvict(value = "notificationCount", allEntries = true)
    public void markAsRead(UUID userId, List<UUID> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            markAllAsRead(userId);
            return;
        }
        int updated = notificationRepository.markSelectedAsRead(notificationIds, userId, LocalDateTime.now());
        log.info("Marked {} notifications as read for user: {}", updated, userId);
    }

    @Override
    @CacheEvict(value = "notificationCount", allEntries = true)
    public void markAllAsRead(UUID userId) {
        int updated = notificationRepository.markAllAsRead(userId, LocalDateTime.now());
        log.info("Marked all {} notifications as read for user: {}", updated, userId);
    }

    @Override
    @CacheEvict(value = "notificationCount", allEntries = true)
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserIdAndActiveTrue(notificationId, userId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId.toString()));

        notification.setActive(false);
        notificationRepository.save(notification);
        log.info("Notification deleted: {} for user: {}", notificationId, userId);
    }
}

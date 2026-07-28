package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.request.NotificationRequest;
import com.skillinfinity.communication.dto.response.NotificationResponse;
import com.skillinfinity.communication.entity.Notification;
import com.skillinfinity.communication.enumeration.NotificationCategory;
import com.skillinfinity.communication.enumeration.NotificationChannel;
import com.skillinfinity.communication.event.CommunicationEventPublisher;
import com.skillinfinity.communication.mapper.CommunicationMapper;
import com.skillinfinity.communication.repository.NotificationRepository;
import com.skillinfinity.communication.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private CommunicationMapper mapper;
    @Mock
    private CommunicationEventPublisher eventPublisher;

    private NotificationService notificationService;
    private UUID userId;
    private UUID notificationId;
    private Notification notification;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(notificationRepository, mapper, eventPublisher);

        userId = UUID.randomUUID();
        notificationId = UUID.randomUUID();

        notification = Notification.builder()
                .id(notificationId)
                .userId(userId)
                .title("Test Notification")
                .body("Test body")
                .category(NotificationCategory.SYSTEM)
                .channel(NotificationChannel.IN_APP)
                .read(false)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createNotification_ShouldCreateSuccessfully() {
        NotificationRequest request = NotificationRequest.builder()
                .userId(userId)
                .title("Test")
                .body("Body")
                .category("SYSTEM")
                .channel("IN_APP")
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(mapper.toNotificationResponse(any(Notification.class))).thenReturn(
                NotificationResponse.builder()
                        .id(notificationId)
                        .userId(userId)
                        .title("Test")
                        .category("SYSTEM")
                        .build());

        NotificationResponse response = notificationService.createNotification(request);

        assertNotNull(response);
        assertEquals(notificationId, response.getId());
        assertEquals("Test", response.getTitle());
        verify(notificationRepository).save(any(Notification.class));
        verify(eventPublisher).publishNotificationSent(any());
    }

    @Test
    void createInAppNotification_ShouldCreateSuccessfully() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(mapper.toNotificationResponse(any(Notification.class))).thenReturn(
                NotificationResponse.builder().id(notificationId).build());

        NotificationResponse response = notificationService.createInAppNotification(
                userId, "Test", "Body", NotificationCategory.SYSTEM);

        assertNotNull(response);
        assertEquals(notificationId, response.getId());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getNotifications_ShouldReturnNotifications() {
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));

        when(notificationRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(eq(userId), any(PageRequest.class)))
                .thenReturn(notificationPage);
        when(mapper.toNotificationResponse(any(Notification.class))).thenReturn(
                NotificationResponse.builder().id(notificationId).build());

        Page<NotificationResponse> responses = notificationService.getNotifications(userId, 0, 20);

        assertNotNull(responses);
        assertEquals(1, responses.getTotalElements());
    }

    @Test
    void getUnreadNotificationCount_ShouldReturnCount() {
        when(notificationRepository.countByUserIdAndReadFalseAndActiveTrue(userId)).thenReturn(3L);

        long count = notificationService.getUnreadNotificationCount(userId);

        assertEquals(3L, count);
    }

    @Test
    void markAllAsRead_ShouldUpdateAll() {
        notificationService.markAllAsRead(userId);

        verify(notificationRepository).markAllAsRead(eq(userId), any());
    }

    @Test
    void markAsRead_WithSpecificIds_ShouldUpdateSelected() {
        List<UUID> ids = List.of(notificationId);

        notificationService.markAsRead(userId, ids);

        verify(notificationRepository).markSelectedAsRead(eq(ids), eq(userId), any());
    }

    @Test
    void deleteNotification_ShouldSoftDelete() {
        when(notificationRepository.findByIdAndUserIdAndActiveTrue(notificationId, userId))
                .thenReturn(Optional.of(notification));

        notificationService.deleteNotification(notificationId, userId);

        assertFalse(notification.isActive());
        verify(notificationRepository).save(notification);
    }
}

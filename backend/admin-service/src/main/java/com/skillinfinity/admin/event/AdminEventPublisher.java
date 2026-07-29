package com.skillinfinity.admin.event;

import com.skillinfinity.admin.entity.SystemAnnouncement;
import com.skillinfinity.admin.entity.PlatformSetting;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishAnnouncement(SystemAnnouncement announcement) {
        AdminAnnouncementEvent event = AdminAnnouncementEvent.builder()
                .eventId(UUID.randomUUID())
                .announcementId(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .targetRole(announcement.getTargetRole())
                .priority(announcement.getPriority())
                .timestamp(LocalDateTime.now())
                .source("admin-service")
                .build();

        log.info("Publishing announcement event: {}", event.getEventId());
        rabbitTemplate.convertAndSend("admin.exchange", "admin.announcement", event);
    }

    public void publishSettingChanged(PlatformSetting setting, String oldValue) {
        PlatformSettingChangedEvent event = PlatformSettingChangedEvent.builder()
                .eventId(UUID.randomUUID())
                .settingKey(setting.getSettingKey())
                .oldValue(oldValue)
                .newValue(setting.getSettingValue())
                .changedBy(UUID.fromString(setting.getUpdatedBy()))
                .timestamp(LocalDateTime.now())
                .source("admin-service")
                .build();

        log.info("Publishing setting changed event: {}", event.getSettingKey());
        rabbitTemplate.convertAndSend("admin.exchange", "admin.setting.changed", event);
    }
}

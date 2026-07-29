package com.skillinfinity.admin.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingChangedEvent {

    private UUID eventId;
    private String settingKey;
    private String oldValue;
    private String newValue;
    private UUID changedBy;
    private LocalDateTime timestamp;
    private String source;
}

package com.skillinfinity.communication.event;

import com.skillinfinity.common.constant.ServiceConstants;
import com.skillinfinity.common.event.BaseEvent;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

@Getter
@ToString(callSuper = true)
public class NotificationSentEvent extends BaseEvent {

    private final UUID notificationId;
    private final UUID userId;
    private final String channel;
    private final String category;
    private final String title;

    public NotificationSentEvent(UUID notificationId, UUID userId, String channel, String category, String title) {
        super("NOTIFICATION_SENT", ServiceConstants.COMMUNICATION_SERVICE);
        this.notificationId = notificationId;
        this.userId = userId;
        this.channel = channel;
        this.category = category;
        this.title = title;
    }
}

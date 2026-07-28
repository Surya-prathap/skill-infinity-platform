package com.skillinfinity.communication.event;

import com.skillinfinity.common.constant.ServiceConstants;
import com.skillinfinity.common.event.BaseEvent;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

@Getter
@ToString(callSuper = true)
public class PushSentEvent extends BaseEvent {

    private final UUID pushNotificationId;
    private final UUID userId;
    private final String platform;
    private final String title;

    public PushSentEvent(UUID pushNotificationId, UUID userId, String platform, String title) {
        super("PUSH_SENT", ServiceConstants.COMMUNICATION_SERVICE);
        this.pushNotificationId = pushNotificationId;
        this.userId = userId;
        this.platform = platform;
        this.title = title;
    }
}

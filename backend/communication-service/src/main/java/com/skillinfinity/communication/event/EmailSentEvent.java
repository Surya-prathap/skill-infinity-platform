package com.skillinfinity.communication.event;

import com.skillinfinity.common.constant.ServiceConstants;
import com.skillinfinity.common.event.BaseEvent;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

@Getter
@ToString(callSuper = true)
public class EmailSentEvent extends BaseEvent {

    private final UUID emailId;
    private final String recipientEmail;
    private final String templateName;
    private final String subject;

    public EmailSentEvent(UUID emailId, String recipientEmail, String templateName, String subject) {
        super("EMAIL_SENT", ServiceConstants.COMMUNICATION_SERVICE);
        this.emailId = emailId;
        this.recipientEmail = recipientEmail;
        this.templateName = templateName;
        this.subject = subject;
    }
}

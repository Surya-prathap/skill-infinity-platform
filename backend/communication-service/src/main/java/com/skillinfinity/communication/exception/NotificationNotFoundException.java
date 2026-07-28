package com.skillinfinity.communication.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class NotificationNotFoundException extends ResourceNotFoundException {

    public NotificationNotFoundException(String identifier) {
        super("Notification", identifier);
    }
}

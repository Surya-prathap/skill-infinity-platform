package com.skillinfinity.communication.exception;

import com.skillinfinity.common.exception.ServiceException;

public class EmailFailedException extends ServiceException {

    public EmailFailedException(String message) {
        super("Failed to send email: " + message);
    }

    public EmailFailedException(String message, Throwable cause) {
        super("Failed to send email: " + message, cause);
    }
}

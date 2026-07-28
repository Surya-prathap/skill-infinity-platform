package com.skillinfinity.communication.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class MessageNotFoundException extends ResourceNotFoundException {

    public MessageNotFoundException(String identifier) {
        super("Message", identifier);
    }
}

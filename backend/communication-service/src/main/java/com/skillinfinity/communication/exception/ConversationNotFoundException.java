package com.skillinfinity.communication.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class ConversationNotFoundException extends ResourceNotFoundException {

    public ConversationNotFoundException(String identifier) {
        super("Conversation", identifier);
    }

    public ConversationNotFoundException(String field, String value) {
        super("Conversation", field, value);
    }
}

package com.skillinfinity.communication.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class AttachmentNotFoundException extends ResourceNotFoundException {

    public AttachmentNotFoundException(String identifier) {
        super("Attachment", identifier);
    }
}

package com.skillinfinity.admin.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class AuditLogNotFoundException extends ResourceNotFoundException {

    public AuditLogNotFoundException(String identifier) {
        super("AuditLog", identifier);
    }
}

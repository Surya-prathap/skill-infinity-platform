package com.skillinfinity.admin.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class AdminNotFoundException extends ResourceNotFoundException {

    public AdminNotFoundException(String identifier) {
        super("Admin", identifier);
    }
}

package com.skillinfinity.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "RESOURCE_NOT_FOUND";

    public ResourceNotFoundException(String resource, String identifier) {
        super("%s not found with identifier: %s".formatted(resource, identifier),
                HttpStatus.NOT_FOUND, DEFAULT_ERROR_CODE);
    }

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, DEFAULT_ERROR_CODE);
    }

    public ResourceNotFoundException(String resource, String field, String value) {
        super("%s not found with %s: '%s'".formatted(resource, field, value),
                HttpStatus.NOT_FOUND, DEFAULT_ERROR_CODE);
    }
}

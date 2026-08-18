package com.skillinfinity.common.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "CONFLICT";

    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT, DEFAULT_ERROR_CODE);
    }
}

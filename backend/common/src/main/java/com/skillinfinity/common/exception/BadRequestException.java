package com.skillinfinity.common.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "BAD_REQUEST";

    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE, cause);
    }
}

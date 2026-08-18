package com.skillinfinity.common.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "FORBIDDEN";

    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN, DEFAULT_ERROR_CODE);
    }
}

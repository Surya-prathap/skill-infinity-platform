package com.skillinfinity.common.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "UNAUTHORIZED";

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, DEFAULT_ERROR_CODE);
    }
}

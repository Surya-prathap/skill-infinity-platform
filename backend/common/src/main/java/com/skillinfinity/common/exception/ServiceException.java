package com.skillinfinity.common.exception;

import org.springframework.http.HttpStatus;

public class ServiceException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "SERVICE_ERROR";

    public ServiceException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, DEFAULT_ERROR_CODE);
    }

    public ServiceException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, DEFAULT_ERROR_CODE, cause);
    }

    public ServiceException(String message, HttpStatus status) {
        super(message, status, DEFAULT_ERROR_CODE);
    }
}

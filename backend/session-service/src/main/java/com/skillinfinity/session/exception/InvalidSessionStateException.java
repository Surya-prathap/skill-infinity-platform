package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidSessionStateException extends BaseException {

    public InvalidSessionStateException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_SESSION_STATE");
    }
}

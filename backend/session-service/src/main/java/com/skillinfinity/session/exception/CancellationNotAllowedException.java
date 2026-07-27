package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class CancellationNotAllowedException extends BaseException {

    public CancellationNotAllowedException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "CANCELLATION_NOT_ALLOWED");
    }
}

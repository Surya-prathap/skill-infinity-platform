package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class RescheduleNotAllowedException extends BaseException {

    public RescheduleNotAllowedException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "RESCHEDULE_NOT_ALLOWED");
    }
}

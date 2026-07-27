package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class DuplicateBookingException extends BaseException {

    public DuplicateBookingException(String message) {
        super(message, HttpStatus.CONFLICT, "DUPLICATE_BOOKING");
    }
}

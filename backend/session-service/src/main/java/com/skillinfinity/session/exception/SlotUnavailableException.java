package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class SlotUnavailableException extends BaseException {

    public SlotUnavailableException(String message) {
        super(message, HttpStatus.CONFLICT, "SLOT_UNAVAILABLE");
    }
}

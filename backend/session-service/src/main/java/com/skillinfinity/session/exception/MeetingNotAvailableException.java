package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class MeetingNotAvailableException extends BaseException {

    public MeetingNotAvailableException(String message) {
        super(message, HttpStatus.NOT_FOUND, "MEETING_NOT_AVAILABLE");
    }
}

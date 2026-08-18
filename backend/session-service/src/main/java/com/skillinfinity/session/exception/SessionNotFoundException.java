package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class SessionNotFoundException extends BaseException {

    public SessionNotFoundException(String field, String value) {
        super("Session not found with " + field + ": " + value,
                HttpStatus.NOT_FOUND,
                "SESSION_NOT_FOUND");
    }
}

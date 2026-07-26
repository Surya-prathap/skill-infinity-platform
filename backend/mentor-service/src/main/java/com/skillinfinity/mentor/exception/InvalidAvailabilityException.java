package com.skillinfinity.mentor.exception;

import com.skillinfinity.common.exception.BadRequestException;

import java.io.Serial;

public class InvalidAvailabilityException extends BadRequestException {

    @Serial
    private static final long serialVersionUID = 1L;

    public InvalidAvailabilityException(String message) {
        super(message);
    }
}

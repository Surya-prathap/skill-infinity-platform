package com.skillinfinity.mentor.exception;

import com.skillinfinity.common.exception.ConflictException;

import java.io.Serial;

public class SlotConflictException extends ConflictException {

    @Serial
    private static final long serialVersionUID = 1L;

    public SlotConflictException(String message) {
        super(message);
    }
}

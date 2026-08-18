package com.skillinfinity.mentor.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

import java.io.Serial;

public class MentorNotFoundException extends ResourceNotFoundException {

    @Serial
    private static final long serialVersionUID = 1L;

    public MentorNotFoundException(String field, String value) {
        super("Mentor", field, value);
    }

    public MentorNotFoundException(String message) {
        super("Mentor", "id", message);
    }
}

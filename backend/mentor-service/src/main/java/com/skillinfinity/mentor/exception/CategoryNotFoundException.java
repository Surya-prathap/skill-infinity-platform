package com.skillinfinity.mentor.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

import java.io.Serial;

public class CategoryNotFoundException extends ResourceNotFoundException {

    @Serial
    private static final long serialVersionUID = 1L;

    public CategoryNotFoundException(String field, String value) {
        super("Category", field, value);
    }
}

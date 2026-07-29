package com.skillinfinity.review.exception;

import com.skillinfinity.common.exception.ConflictException;

public class DuplicateReviewException extends ConflictException {

    public DuplicateReviewException(String message) {
        super(message);
    }
}

package com.skillinfinity.review.exception;

import com.skillinfinity.common.exception.BadRequestException;

public class InvalidRatingException extends BadRequestException {

    public InvalidRatingException(String message) {
        super(message);
    }
}

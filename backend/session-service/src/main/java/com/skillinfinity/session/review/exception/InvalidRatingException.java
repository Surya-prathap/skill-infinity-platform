package com.skillinfinity.session.review.exception;

import com.skillinfinity.common.exception.BadRequestException;

public class InvalidRatingException extends BadRequestException {

    public InvalidRatingException(String message) {
        super(message);
    }
}

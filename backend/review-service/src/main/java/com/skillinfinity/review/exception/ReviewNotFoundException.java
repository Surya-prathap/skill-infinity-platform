package com.skillinfinity.review.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class ReviewNotFoundException extends ResourceNotFoundException {

    public ReviewNotFoundException(String identifier) {
        super("Review", identifier);
    }
}

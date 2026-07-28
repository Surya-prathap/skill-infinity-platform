package com.skillinfinity.community.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class PostNotFoundException extends ResourceNotFoundException {

    public PostNotFoundException(String identifier) {
        super("Post", identifier);
    }
}

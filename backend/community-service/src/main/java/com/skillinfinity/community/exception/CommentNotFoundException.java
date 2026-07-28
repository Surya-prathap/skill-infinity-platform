package com.skillinfinity.community.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class CommentNotFoundException extends ResourceNotFoundException {

    public CommentNotFoundException(String identifier) {
        super("Comment", identifier);
    }
}

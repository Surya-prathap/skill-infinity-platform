package com.skillinfinity.community.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class CommunityNotFoundException extends ResourceNotFoundException {

    public CommunityNotFoundException(String identifier) {
        super("Community", identifier);
    }
}

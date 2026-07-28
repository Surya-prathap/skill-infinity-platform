package com.skillinfinity.community.exception;

import com.skillinfinity.common.exception.BadRequestException;

public class PollExpiredException extends BadRequestException {

    public PollExpiredException() {
        super("This poll has expired and no longer accepts votes");
    }
}

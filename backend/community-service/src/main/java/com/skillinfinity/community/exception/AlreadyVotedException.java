package com.skillinfinity.community.exception;

import com.skillinfinity.common.exception.ConflictException;

public class AlreadyVotedException extends ConflictException {

    public AlreadyVotedException() {
        super("You have already voted on this poll");
    }
}

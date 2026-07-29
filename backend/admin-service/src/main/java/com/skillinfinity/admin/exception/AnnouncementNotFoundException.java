package com.skillinfinity.admin.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class AnnouncementNotFoundException extends ResourceNotFoundException {

    public AnnouncementNotFoundException(String identifier) {
        super("Announcement", identifier);
    }
}

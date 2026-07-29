package com.skillinfinity.admin.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class SupportTicketNotFoundException extends ResourceNotFoundException {

    public SupportTicketNotFoundException(String identifier) {
        super("SupportTicket", identifier);
    }
}

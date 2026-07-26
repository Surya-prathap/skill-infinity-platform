package com.skillinfinity.mentor.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

import java.io.Serial;

public class CertificationNotFoundException extends ResourceNotFoundException {

    @Serial
    private static final long serialVersionUID = 1L;

    public CertificationNotFoundException(String field, String value) {
        super("Certification", field, value);
    }
}

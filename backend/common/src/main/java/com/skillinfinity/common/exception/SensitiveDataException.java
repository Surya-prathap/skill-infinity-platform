package com.skillinfinity.common.exception;

import com.skillinfinity.common.enums.ErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when sensitive data (passwords, secrets) is mishandled.
 */
public class SensitiveDataException extends BaseException {

    public SensitiveDataException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.SENSITIVE_DATA_ERROR.name());
    }

    public SensitiveDataException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.SENSITIVE_DATA_ERROR.name(), cause);
    }
}

package com.skillinfinity.payment.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class DuplicateTransactionException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "DUPLICATE_TRANSACTION";

    public DuplicateTransactionException(String message) {
        super(message, HttpStatus.CONFLICT, DEFAULT_ERROR_CODE);
    }
}

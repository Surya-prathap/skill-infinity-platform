package com.skillinfinity.wallet.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class DuplicateTransactionException extends BaseException {

    private static final String ERROR_CODE = "DUPLICATE_TRANSACTION";

    public DuplicateTransactionException(String message) {
        super(message, HttpStatus.CONFLICT, ERROR_CODE);
    }

    public DuplicateTransactionException(String message, Throwable cause) {
        super(message, HttpStatus.CONFLICT, ERROR_CODE, cause);
    }
}

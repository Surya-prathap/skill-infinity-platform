package com.skillinfinity.wallet.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InsufficientBalanceException extends BaseException {

    private static final String ERROR_CODE = "INSUFFICIENT_BALANCE";

    public InsufficientBalanceException(String message) {
        super(message, HttpStatus.BAD_REQUEST, ERROR_CODE);
    }

    public InsufficientBalanceException(String message, Throwable cause) {
        super(message, HttpStatus.BAD_REQUEST, ERROR_CODE, cause);
    }
}

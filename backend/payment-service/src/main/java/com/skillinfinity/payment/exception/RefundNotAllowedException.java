package com.skillinfinity.payment.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class RefundNotAllowedException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "REFUND_NOT_ALLOWED";

    public RefundNotAllowedException(String message) {
        super(message, HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE);
    }
}

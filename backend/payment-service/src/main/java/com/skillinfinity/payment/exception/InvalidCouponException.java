package com.skillinfinity.payment.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidCouponException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "INVALID_COUPON";

    public InvalidCouponException(String message) {
        super(message, HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE);
    }
}

package com.skillinfinity.payment.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class PaymentFailedException extends BaseException {

    private static final String DEFAULT_ERROR_CODE = "PAYMENT_FAILED";

    public PaymentFailedException(String message) {
        super(message, HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE);
    }

    public PaymentFailedException(String message, String failureCode) {
        super("Payment failed: " + message + " (code: " + failureCode + ")",
                HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE);
    }
}

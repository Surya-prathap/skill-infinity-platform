package com.skillinfinity.session.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class BookingNotFoundException extends BaseException {

    public BookingNotFoundException(String field, String value) {
        super("Booking not found with " + field + ": " + value,
                HttpStatus.NOT_FOUND,
                "BOOKING_NOT_FOUND");
    }
}

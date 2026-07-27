package com.skillinfinity.wallet.exception;

import com.skillinfinity.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class WalletFrozenException extends BaseException {

    private static final String ERROR_CODE = "WALLET_FROZEN";

    public WalletFrozenException(String message) {
        super(message, HttpStatus.FORBIDDEN, ERROR_CODE);
    }

    public WalletFrozenException(String message, Throwable cause) {
        super(message, HttpStatus.FORBIDDEN, ERROR_CODE, cause);
    }
}

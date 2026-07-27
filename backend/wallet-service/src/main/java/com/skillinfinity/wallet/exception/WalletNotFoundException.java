package com.skillinfinity.wallet.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class WalletNotFoundException extends ResourceNotFoundException {

    public WalletNotFoundException(String identifier) {
        super("Wallet", identifier);
    }

    public WalletNotFoundException(String field, String value) {
        super("Wallet", field, value);
    }
}

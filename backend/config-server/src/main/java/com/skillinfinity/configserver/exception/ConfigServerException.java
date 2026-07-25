package com.skillinfinity.configserver.exception;

import lombok.Getter;

/**
 * Base exception for Config Server errors.
 * <p>
 * This exception is thrown when configuration-related operations fail,
 * such as repository connection issues, configuration loading failures,
 * or invalid configuration data.
 */
@Getter
public class ConfigServerException extends RuntimeException {

    private final String errorCode;
    private final String details;

    public ConfigServerException(String message) {
        super(message);
        this.errorCode = "CONFIG_SERVER_ERROR";
        this.details = null;
    }

    public ConfigServerException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.details = null;
    }

    public ConfigServerException(String message, String errorCode, String details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public ConfigServerException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "CONFIG_SERVER_ERROR";
        this.details = cause.getMessage();
    }

    public ConfigServerException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = cause.getMessage();
    }
}

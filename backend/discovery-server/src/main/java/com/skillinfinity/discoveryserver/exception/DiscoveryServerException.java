package com.skillinfinity.discoveryserver.exception;

import lombok.Getter;

/**
 * Exception class for Discovery Server errors.
 * Thrown when Eureka server encounters issues during initialization or operation.
 */
@Getter
public class DiscoveryServerException extends RuntimeException {

    private final String errorCode;

    public DiscoveryServerException(String message) {
        super(message);
        this.errorCode = "DISCOVERY_SERVER_ERROR";
    }

    public DiscoveryServerException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public DiscoveryServerException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "DISCOVERY_SERVER_ERROR";
    }
}

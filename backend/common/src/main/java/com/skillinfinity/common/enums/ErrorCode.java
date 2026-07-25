package com.skillinfinity.common.enums;

/**
 * Enum representing standard error codes used across all services.
 */
public enum ErrorCode {
    // General
    INTERNAL_ERROR,
    VALIDATION_ERROR,
    NOT_FOUND,
    BAD_REQUEST,
    CONFLICT,
    UNAUTHORIZED,
    FORBIDDEN,
    SERVICE_UNAVAILABLE,
    RATE_LIMIT_EXCEEDED,
    DUPLICATE_ENTRY,
    INVALID_INPUT,
    MISSING_REQUIRED_FIELD,

    // Business
    RESOURCE_NOT_FOUND,
    OPERATION_FAILED,
    INVALID_STATE,
    INVALID_OPERATION,
    DEPENDENCY_FAILURE
}

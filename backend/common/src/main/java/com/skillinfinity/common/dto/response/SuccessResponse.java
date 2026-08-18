package com.skillinfinity.common.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Generic success response wrapper for API responses.
 * Provides a consistent response structure for successful operations.
 *
 * @param <T> the type of the response data
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SuccessResponse<T>(
        boolean success,
        String message,
        T data,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp
) {
    public SuccessResponse(String message, T data) {
        this(true, message, data, LocalDateTime.now());
    }

    public static <T> SuccessResponse<T> of(T data) {
        return new SuccessResponse<>("Operation completed successfully", data);
    }

    public static <T> SuccessResponse<T> of(String message, T data) {
        return new SuccessResponse<>(true, message, data, LocalDateTime.now());
    }
}

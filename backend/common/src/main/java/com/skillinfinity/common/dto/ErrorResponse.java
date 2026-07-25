package com.skillinfinity.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    boolean success,
    String message,
    List<ValidationError> errors,
    String path,
    String requestId,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime timestamp
) {

    public static ErrorResponse of(String message, List<ValidationError> errors, String path, String requestId) {
        return new ErrorResponse(false, message, errors, path, requestId, LocalDateTime.now());
    }

    public static ErrorResponse of(String message, String path, String requestId) {
        return new ErrorResponse(false, message, null, path, requestId, LocalDateTime.now());
    }
}

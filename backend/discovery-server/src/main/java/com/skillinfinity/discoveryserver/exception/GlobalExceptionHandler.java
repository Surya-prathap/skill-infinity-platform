package com.skillinfinity.discoveryserver.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Global exception handler for the Discovery Server.
 * Returns meaningful error responses without exposing stack traces.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DiscoveryServerException.class)
    public ResponseEntity<Map<String, Object>> handleDiscoveryServerException(
            DiscoveryServerException ex, HttpServletRequest request) {
        log.warn("Discovery Server error: {} (code: {})", ex.getMessage(), ex.getErrorCode());
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unexpected error in Discovery Server", ex);

        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.",
                request
        );
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(
            NoResourceFoundException ex,
            HttpServletRequest request) {

        // Ignore browser favicon request
        if (request.getRequestURI().equals("/favicon.ico")) {
            return ResponseEntity.notFound().build();
        }

        log.warn("Resource not found: {}", request.getRequestURI());

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "Requested resource not found.",
                request
        );
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String message, HttpServletRequest request) {
        return new ResponseEntity<>(Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message,
                "path", request.getRequestURI()
        ), status);
    }
}

package com.skillinfinity.user.exception;

import com.skillinfinity.common.dto.ErrorResponse;
import com.skillinfinity.common.dto.ValidationError;
import com.skillinfinity.common.exception.BaseException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ValidationError> errors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    String field = (error instanceof FieldError fieldError)
                            ? fieldError.getField() : error.getObjectName();
                    return new ValidationError(field, error.getDefaultMessage());
                })
                .toList();

        log.warn("Validation failed: {} errors for path: {}", errors.size(), request.getRequestURI());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of("Input validation failed", errors, request.getRequestURI(),
                        extractRequestId(request)));
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        log.warn("Business exception: {} - {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(ErrorResponse.of(ex.getMessage(), request.getRequestURI(), extractRequestId(request)));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error: {} for path: {}", ex.getMessage(), request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("An unexpected error occurred. Please try again later.",
                        request.getRequestURI(), extractRequestId(request)));
    }

    private String extractRequestId(HttpServletRequest request) {
        Object attr = request.getAttribute("requestId");
        if (attr instanceof String id && !id.isBlank()) return id;
        String headerId = request.getHeader("X-Request-ID");
        return headerId != null && !headerId.isBlank() ? headerId : UUID.randomUUID().toString();
    }
}

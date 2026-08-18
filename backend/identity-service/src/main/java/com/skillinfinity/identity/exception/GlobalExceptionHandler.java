package com.skillinfinity.identity.exception;

import com.skillinfinity.common.dto.ErrorResponse;
import com.skillinfinity.common.dto.ValidationError;
import com.skillinfinity.common.exception.BaseException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String REQUEST_ID_ATTR = "requestId";

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

        String path = request.getRequestURI();
        String requestId = extractRequestId(request);

        log.warn("Validation failed: {} errors for path: {}", errors.size(), path);
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of("Input validation failed", errors, path, requestId));
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        String path = request.getRequestURI();
        String requestId = extractRequestId(request);

        log.warn("Business exception: {} - {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(ErrorResponse.of(ex.getMessage(), path, requestId));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        String path = request.getRequestURI();
        String requestId = extractRequestId(request);

        log.warn("Authentication failed: {}", path);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of("Invalid email or password", path, requestId));
    }

    /**
     * Covers the race between the existsByEmail/existsByUsername pre-checks and the
     * actual insert: when two registrations with the same email/username overlap, the
     * insert can fail on the unique constraint at commit time. Report it as a friendly
     * 409 (already registered) instead of a generic 500.
     * <p>
     * Only duplicate-key violations (unique constraints) map to the friendly conflict
     * response — other integrity violations (NOT NULL, foreign keys) are real server
     * errors and keep returning 500.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        String path = request.getRequestURI();
        String requestId = extractRequestId(request);
        String causeMessage = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        boolean duplicateKey = causeMessage != null && (
                causeMessage.contains("Duplicate") || causeMessage.contains("duplicate")
                        || causeMessage.contains("UK_")
                        || causeMessage.matches("(?i).*unique.*constraint.*"));

        if (!duplicateKey) {
            log.error("Data integrity violation on path {}: {}", path, causeMessage);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("An unexpected error occurred. Please try again later.", path, requestId));
        }

        log.warn("Registration duplicate key on path {}: {}", path, causeMessage);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(
                        "This account is already registered. Please sign in instead.",
                        path, requestId));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        String path = request.getRequestURI();
        String requestId = extractRequestId(request);

        log.error("Unexpected error: {} for path: {}", ex.getMessage(), path, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("An unexpected error occurred. Please try again later.", path, requestId));
    }

    private String extractRequestId(HttpServletRequest request) {
        Object attr = request.getAttribute(REQUEST_ID_ATTR);
        if (attr instanceof String id && !id.isBlank()) {
            return id;
        }
        String headerId = request.getHeader("X-Request-ID");
        return headerId != null && !headerId.isBlank() ? headerId : UUID.randomUUID().toString();
    }
}

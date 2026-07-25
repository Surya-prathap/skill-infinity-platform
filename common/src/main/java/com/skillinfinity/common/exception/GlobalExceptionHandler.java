package com.skillinfinity.common.exception;

import com.skillinfinity.common.dto.ErrorResponse;
import com.skillinfinity.common.dto.ValidationError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String REQUEST_ID_ATTR = "requestId";
    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            @NonNull MethodArgumentNotValidException ex,
            @NonNull HttpHeaders headers,
            @NonNull HttpStatusCode status,
            @NonNull WebRequest request) {
        List<ValidationError> errors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    String field = (error instanceof FieldError fieldError) ? fieldError.getField() : error.getObjectName();
                    return new ValidationError(field, error.getDefaultMessage());
                })
                .toList();

        String path = extractPath(request);
        String requestId = generateRequestId(request);

        ErrorResponse errorResponse = ErrorResponse.of("Input validation failed", errors, path, requestId);

        log.warn("Validation failed: {} errors, path: {}, requestId: {}", errors.size(), path, requestId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId(request);

        ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage(), path, requestId);

        log.error("Business exception: {} - {}, path: {}, requestId: {}",
                ex.getErrorCode(), ex.getMessage(), path, requestId);
        return ResponseEntity.status(ex.getStatus()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId(request);

        ErrorResponse errorResponse = ErrorResponse.of(
                "An unexpected error occurred. Please try again later.", path, requestId);

        log.error("Unexpected error occurred, path: {}, requestId: {}", path, requestId, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        if (description != null && description.startsWith("uri=")) {
            return description.substring(4);
        }
        return description;
    }

    private String generateRequestId(WebRequest request) {
        // Check request attribute first (set by RequestTracingFilter)
        Object attr = request.getAttribute(REQUEST_ID_ATTR, WebRequest.SCOPE_REQUEST);
        if (attr instanceof String id && !id.isBlank()) {
            return id;
        }
        // Fall back to request header
        String headerId = request.getHeader(REQUEST_ID_HEADER);
        if (headerId != null && !headerId.isBlank()) {
            return headerId;
        }
        // Ultimate fallback
        return UUID.randomUUID().toString();
    }
}

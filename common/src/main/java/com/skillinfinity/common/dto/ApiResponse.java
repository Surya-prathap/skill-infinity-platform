package com.skillinfinity.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    String path,
    String requestId,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime timestamp
) {

    private static final String REQUEST_ID_ATTR = "requestId";

    public static <T> ApiResponse<T> success(T data) {
        return create(true, "Operation completed successfully", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return create(true, message, data);
    }

    public static <T> ApiResponse<T> success(T data, String path, String requestId) {
        return new ApiResponse<>(true, "Operation completed successfully", data, path, requestId, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> success(String message, T data, String path, String requestId) {
        return new ApiResponse<>(true, message, data, path, requestId, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message) {
        return create(false, message, null);
    }

    public static <T> ApiResponse<T> error(String message, String path, String requestId) {
        return new ApiResponse<>(false, message, null, path, requestId, LocalDateTime.now());
    }

    private static <T> ApiResponse<T> create(boolean success, String message, T data) {
        HttpServletRequest request = getCurrentRequest();
        String path = (request != null) ? request.getRequestURI() : null;
        String requestId = extractRequestId(request);
        return new ApiResponse<>(success, message, data, path, requestId, LocalDateTime.now());
    }

    private static String extractRequestId(HttpServletRequest request) {
        if (request != null) {
            // Prefer request attribute set by RequestTracingFilter
            Object attr = request.getAttribute(REQUEST_ID_ATTR);
            if (attr instanceof String id && !id.isBlank()) {
                return id;
            }
            // Fall back to header (e.g., if filter wasn't configured)
            String headerId = request.getHeader("X-Request-ID");
            if (headerId != null && !headerId.isBlank()) {
                return headerId;
            }
        }
        return UUID.randomUUID().toString();
    }

    private static HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest();
        }
        return null;
    }
}

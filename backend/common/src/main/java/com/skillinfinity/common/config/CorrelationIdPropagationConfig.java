package com.skillinfinity.common.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

/**
 * Utility for propagating correlation ID across inter-service communication.
 * Ensures traceability across the entire request chain.
 * Services using RestTemplate or WebClient should call {@link #getCorrelationId()}
 * and add it to outgoing requests as the "X-Correlation-ID" header.
 */
@Slf4j
@Configuration
public class CorrelationIdPropagationConfig {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    /**
     * Retrieves the current correlation ID from MDC, request attributes, or generates a new one.
     */
    public static String getCorrelationId() {
        // Try to get from MDC first (set by RequestTracingFilter)
        String correlationId = MDC.get("correlationId");

        // Fall back to request attribute
        if (correlationId == null || correlationId.isBlank()) {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                correlationId = (String) request.getAttribute("requestId");
            }
        }

        // Final fallback: generate new correlation ID
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        return correlationId;
    }
}

package com.skillinfinity.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestTracingFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_ATTR = "requestId";
    private static final String CORRELATION_ID_KEY = "correlationId";
    private static final String REQUEST_PATH_KEY = "requestPath";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        // Store in request attribute for downstream access (ApiResponse, etc.)
        request.setAttribute(REQUEST_ID_ATTR, requestId);

        // Store in MDC for logging
        MDC.put(CORRELATION_ID_KEY, requestId);
        MDC.put(REQUEST_PATH_KEY, request.getRequestURI());

        // Set on response header
        response.setHeader(REQUEST_ID_HEADER, requestId);

        log.info("Incoming request: {} {}, requestId: {}", request.getMethod(), request.getRequestURI(), requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}

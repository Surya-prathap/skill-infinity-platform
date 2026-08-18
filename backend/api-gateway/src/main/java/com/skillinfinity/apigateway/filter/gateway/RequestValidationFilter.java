package com.skillinfinity.apigateway.filter.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Gateway filter that validates incoming requests.
 * Checks for malicious payloads, SQL injection patterns, and XSS attempts.
 */
@Slf4j
@Component
public class RequestValidationFilter implements GlobalFilter, Ordered {

    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            ".*((')|(--)|(;)|(\\b(OR|AND)\\b\\s+\\w+\\s*=)|(\\bUNION\\b\\s+\\bSELECT\\b)).*",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern XSS_PATTERN =
            Pattern.compile(".*(<script|<iframe|<object|<embed|<svg|onerror|onload|onclick|javascript:).*",
                    Pattern.CASE_INSENSITIVE);

    private static final List<String> BLOCKED_HEADERS = List.of(
            "X-Forwarded-For", "X-Real-IP", "X-Forwarded-Proto", "X-Forwarded-Host"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip validation for actuator and swagger endpoints
        if (path.startsWith("/actuator") || path.startsWith("/swagger") || path.startsWith("/v3/api-docs")) {
            return chain.filter(exchange);
        }

        // Validate query parameters for injection attempts
        String query = request.getURI().getQuery();
        if (query != null && !query.isBlank()) {
            if (containsMaliciousPattern(query)) {
                log.warn("Blocked request with malicious query params: path={}", path);
                exchange.getResponse().setStatusCode(HttpStatus.BAD_REQUEST);
                return exchange.getResponse().setComplete();
            }
        }

        // Validate path for malicious patterns
        if (containsMaliciousPattern(path)) {
            log.warn("Blocked request with malicious path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.BAD_REQUEST);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 5;
    }

    private boolean containsMaliciousPattern(String input) {
        return SQL_INJECTION_PATTERN.matcher(input).matches()
                || XSS_PATTERN.matcher(input).matches();
    }
}

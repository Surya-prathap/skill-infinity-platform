package com.skillinfinity.apigateway.filter;

import com.skillinfinity.apigateway.constant.GatewayConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Global filter that logs incoming requests with structured information.
 * Logs method, path, headers, and timing for observability.
 */
@Slf4j
@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        Instant start = Instant.now();

        String correlationId = request.getHeaders()
                .getFirst(GatewayConstants.CORRELATION_ID_HEADER);

        log.info("Incoming request | correlationId: {} | method: {} | path: {} | query: {}",
                correlationId,
                request.getMethod(),
                request.getURI().getPath(),
                request.getURI().getQuery() != null ? request.getURI().getQuery() : "none");

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = Instant.now().toEpochMilli() - start.toEpochMilli();
            log.info("Request completed | correlationId: {} | method: {} | path: {} | status: {} | duration: {}ms",
                    correlationId,
                    request.getMethod(),
                    request.getURI().getPath(),
                    exchange.getResponse().getStatusCode() != null
                            ? exchange.getResponse().getStatusCode().value() : "unknown",
                    duration);
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE - 1;
    }
}

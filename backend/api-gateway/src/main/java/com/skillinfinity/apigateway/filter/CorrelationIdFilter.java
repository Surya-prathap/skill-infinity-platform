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

import java.util.UUID;

/**
 * Global filter that adds a correlation ID to every request.
 * <p>
 * The correlation ID is generated if not present in the incoming request,
 * and propagated to downstream services via a request header.
 */
@Slf4j
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        String correlationId = request.getHeaders()
                .getFirst(GatewayConstants.CORRELATION_ID_HEADER);

        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        log.debug("Correlation ID: {} | Method: {} | Path: {}",
                correlationId, request.getMethod(), request.getURI().getPath());

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(GatewayConstants.CORRELATION_ID_HEADER, correlationId)
                .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();

        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}

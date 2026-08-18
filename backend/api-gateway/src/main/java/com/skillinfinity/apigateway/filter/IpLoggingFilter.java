package com.skillinfinity.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

/**
 * Global filter that logs client IP addresses and forwards them to downstream services.
 * Essential for audit logging and rate limiting.
 */
@Slf4j
@Component
public class IpLoggingFilter implements GlobalFilter, Ordered {

    private static final String X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String X_REAL_IP = "X-Real-IP";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String clientIp = extractClientIp(request);

        if (clientIp != null) {
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header(X_REAL_IP, clientIp)
                    .header(X_FORWARDED_FOR, clientIp)
                    .build();
            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

            log.debug("Client IP: {} | Path: {} | Method: {}",
                    clientIp, request.getURI().getPath(), request.getMethod());

            return chain.filter(mutatedExchange);
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 3;
    }

    private String extractClientIp(ServerHttpRequest request) {
        // Try X-Forwarded-For header first
        String xForwardedFor = request.getHeaders().getFirst(X_FORWARDED_FOR);
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Get the first IP in the chain (original client)
            return xForwardedFor.split(",")[0].trim();
        }

        // Try X-Real-IP header
        String xRealIp = request.getHeaders().getFirst(X_REAL_IP);
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }

        // Fall back to remote address
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null) {
            return remoteAddress.getAddress().getHostAddress();
        }

        return null;
    }
}

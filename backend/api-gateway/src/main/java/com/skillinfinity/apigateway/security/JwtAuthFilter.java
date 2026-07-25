package com.skillinfinity.apigateway.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Placeholder filter for future JWT authentication.
 * <p>
 * This filter will validate JWT tokens on incoming requests and
 * extract user information for downstream services.
 * <p>
 * Implementation is deferred to the Identity Service phase (Day 2).
 */
@Slf4j
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final boolean AUTH_ENABLED = false;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!AUTH_ENABLED) {
            return chain.filter(exchange);
        }

        // TODO: Implement JWT validation in Day 2 (Identity Service phase)
        // 1. Extract Bearer token from Authorization header
        // 2. Validate JWT signature and expiry
        // 3. Extract user ID and roles from token
        // 4. Set X-User-ID and X-User-Roles headers for downstream services
        // 5. Allow or reject based on route authorization rules

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}

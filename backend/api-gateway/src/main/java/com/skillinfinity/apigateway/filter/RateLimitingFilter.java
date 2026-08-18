package com.skillinfinity.apigateway.filter;

import com.skillinfinity.apigateway.constant.GatewayConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting filter using in-memory token bucket algorithm.
 * Provides basic protection against request floods.
 */
@Slf4j
@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {

    @Value("${api-gateway.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${api-gateway.rate-limit.default-per-mit:100}")
    private int defaultPermitsPerSecond;

    // Simple in-memory rate limiter for development
    private final Map<String, RateLimitEntry> rateLimitMap = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!rateLimitEnabled) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/actuator") || path.startsWith("/swagger") || path.startsWith("/v3/api-docs")) {
            return chain.filter(exchange);
        }

        String clientIp = extractClientIp(exchange.getRequest());
        if (clientIp == null) {
            clientIp = "unknown";
        }

        RateLimitEntry entry = rateLimitMap.computeIfAbsent(clientIp, k -> new RateLimitEntry(defaultPermitsPerSecond));

        if (!entry.tryConsume()) {
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add("Retry-After", "1");
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    private String extractClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null) {
            return remoteAddress.getAddress().getHostAddress();
        }
        return null;
    }

    /**
     * Simple token bucket rate limit entry.
     */
    private static class RateLimitEntry {
        private final int maxTokens;
        private final AtomicInteger tokens;
        private volatile long lastRefillTime;

        RateLimitEntry(int maxTokens) {
            this.maxTokens = maxTokens;
            this.tokens = new AtomicInteger(maxTokens);
            this.lastRefillTime = System.currentTimeMillis();
        }

        boolean tryConsume() {
            refill();
            int currentTokens = tokens.get();
            while (currentTokens > 0) {
                if (tokens.compareAndSet(currentTokens, currentTokens - 1)) {
                    return true;
                }
                currentTokens = tokens.get();
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long timeSinceLastRefill = now - lastRefillTime;
            if (timeSinceLastRefill > 1000) {
                synchronized (this) {
                    if (now - lastRefillTime > 1000) {
                        int tokensToAdd = (int) (timeSinceLastRefill / 1000) * maxTokens;
                        tokens.set(Math.min(maxTokens, tokens.get() + tokensToAdd));
                        lastRefillTime = now;
                    }
                }
            }
        }
    }
}

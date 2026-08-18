package com.skillinfinity.apigateway.security;

import com.skillinfinity.apigateway.constant.GatewayConstants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Validates JWTs on protected routes and injects the verified identity into
 * the downstream request as {@code X-User-ID} / {@code X-User-Roles} headers,
 * which every backend service trusts (see GatewayHeaderAuthenticationFilter
 * in the common module).
 * <p>
 * Public paths pass through untouched. Any client-supplied identity headers
 * are stripped first so they can never be spoofed.
 */
@Slf4j
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final SecretKey secretKey;

    public JwtAuthFilter(@Value("${app.jwt.secret:}") String secret) {
        if (StringUtils.hasText(secret)) {
            this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        } else {
            this.secretKey = null;
            log.warn("app.jwt.secret is not configured — all protected routes will be rejected with 401.");
        }
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Public endpoints (auth, health, swagger...) are not authenticated.
        if (isPublicPath(path)) {
            return chain.filter(exchange.mutate().request(stripIdentityHeaders(request)).build());
        }

        if (secretKey == null) {
            return reject(exchange, "Authentication is not configured on the gateway");
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        String token = extractToken(authHeader);
        if (token == null) {
            log.warn("Missing or malformed Authorization header for path: {}", path);
            return reject(exchange, "Missing or malformed Authorization header");
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.getSubject();
            if (!StringUtils.hasText(userId)) {
                return reject(exchange, "Token is missing the subject claim");
            }

            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            String rolesHeader = roles == null ? "" : String.join(",", roles);

            ServerHttpRequest authenticated = request.mutate()
                    .headers(headers -> {
                        headers.remove(GatewayConstants.USER_ID_HEADER);
                        headers.remove(GatewayConstants.USER_ROLES_HEADER);
                        headers.set(GatewayConstants.USER_ID_HEADER, userId);
                        headers.set(GatewayConstants.USER_ROLES_HEADER, rolesHeader);
                    })
                    .build();

            return chain.filter(exchange.mutate().request(authenticated).build());
        } catch (Exception e) {
            log.warn("JWT validation failed for {}: {}", path, e.getMessage());
            return reject(exchange, "Invalid or expired token");
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    private boolean isPublicPath(String path) {
        return Arrays.stream(GatewayConstants.PUBLIC_PATHS)
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private String extractToken(String authHeader) {
        if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            return token.isEmpty() ? null : token;
        }
        return null;
    }

    /** Removes any client-supplied identity headers (anti-spoofing). */
    private ServerHttpRequest stripIdentityHeaders(ServerHttpRequest request) {
        return request.mutate()
                .headers(headers -> {
                    headers.remove(GatewayConstants.USER_ID_HEADER);
                    headers.remove(GatewayConstants.USER_ROLES_HEADER);
                })
                .build();
    }

    private Mono<Void> reject(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}

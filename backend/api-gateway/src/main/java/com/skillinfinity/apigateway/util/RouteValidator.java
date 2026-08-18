package com.skillinfinity.apigateway.util;

import com.skillinfinity.apigateway.constant.GatewayConstants;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;

/**
 * Utility class for validating routes and determining
 * if authentication is required for a given path.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RouteValidator {

    /**
     * Checks if the given request path is a public endpoint
     * that does not require authentication.
     *
     * @param request the incoming request
     * @return true if the path is public, false otherwise
     */
    public static boolean isPublicPath(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        for (String publicPath : GatewayConstants.PUBLIC_PATHS) {
            if (pathMatches(path, publicPath)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if the given path matches a pattern (simple glob matching).
     * Supports ** at the end of patterns for wildcard matching.
     */
    private static boolean pathMatches(String path, String pattern) {
        if (pattern.endsWith("**")) {
            String prefix = pattern.substring(0, pattern.length() - 2);
            return path.startsWith(prefix);
        }
        return path.equals(pattern);
    }
}

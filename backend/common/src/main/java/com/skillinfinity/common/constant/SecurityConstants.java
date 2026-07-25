package com.skillinfinity.common.constant;

public final class SecurityConstants {

    private SecurityConstants() {
        throw new UnsupportedOperationException("This is a constants class and cannot be instantiated");
    }

    // JWT
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String SERVICE_ID_HEADER = "X-Service-ID";
    public static final String USER_ID_CLAIM = "userId";
    public static final String USER_ROLES_CLAIM = "roles";

    // Roles
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_MENTOR = "ROLE_MENTOR";
    public static final String ROLE_LEARNER = "ROLE_LEARNER";
    public static final String ROLE_USER = "ROLE_USER";

    // Token Expiry (in milliseconds)
    public static final long ACCESS_TOKEN_EXPIRY = 900_000; // 15 minutes
    public static final long REFRESH_TOKEN_EXPIRY = 604_800_000; // 7 days

    // Public Paths
    public static final String[] PUBLIC_PATHS = {
            "/api/v1/auth/**",
            "/api/v1/public/**",
            "/actuator/health/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**"
    };
}

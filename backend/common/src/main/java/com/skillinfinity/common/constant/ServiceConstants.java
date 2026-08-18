package com.skillinfinity.common.constant;

public final class ServiceConstants {

    private ServiceConstants() {
        throw new UnsupportedOperationException("This is a constants class and cannot be instantiated");
    }

    // Service Names
    public static final String IDENTITY_SERVICE = "identity-service";
    public static final String USER_SERVICE = "user-service";
    public static final String MENTOR_SERVICE = "mentor-service";
    public static final String SESSION_SERVICE = "session-service";
    public static final String WALLET_SERVICE = "wallet-service";
    public static final String PAYMENT_SERVICE = "payment-service";
    public static final String REVIEW_SERVICE = "review-service";
    public static final String ADMIN_SERVICE = "admin-service";
    public static final String API_GATEWAY = "api-gateway";
    public static final String CONFIG_SERVER = "config-server";
    public static final String DISCOVERY_SERVER = "discovery-server";

    // API Paths
    public static final String API_V1 = "/api/v1";
    public static final String IDENTITY_API = API_V1 + "/auth";
    public static final String USER_API = API_V1 + "/users";
    public static final String MENTOR_API = API_V1 + "/mentors";
    public static final String SESSION_API = API_V1 + "/sessions";
    public static final String WALLET_API = API_V1 + "/wallet";
    public static final String PAYMENT_API = API_V1 + "/payments";
    public static final String REVIEW_API = API_V1 + "/reviews";
    public static final String ADMIN_API = API_V1 + "/admin";

    // Date Formats
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
    public static final String TIME_FORMAT = "HH:mm:ss";

    // Pagination
    public static final String DEFAULT_PAGE = "0";
    public static final String DEFAULT_SIZE = "20";
    public static final String MAX_SIZE = "100";
}

package com.skillinfinity.common.validation;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Centralized regex constants for common validation patterns.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RegexConstants {

    public static final String EMAIL = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    public static final String PHONE = "^\\+?[1-9]\\d{1,14}$";
    public static final String PASSWORD = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
    public static final String USERNAME = "^[a-zA-Z0-9_-]{3,50}$";
    public static final String UUID = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
    public static final String URL = "^(https?://)([\\w.-]+)(:[\\d]+)?(/[\\w./%-]*)?$";
    public static final String ALPHANUMERIC = "^[a-zA-Z0-9]+$";
    public static final String ALPHANUMERIC_WITH_SPACES = "^[a-zA-Z0-9 ]+$";
}

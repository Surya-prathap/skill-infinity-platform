package com.skillinfinity.common.annotation;

import java.lang.annotation.*;

/**
 * Annotation to apply rate limiting to specific controller methods.
 * The rate limiter name corresponds to a Resilience4j rate limiter configuration.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimited {
    String value() default "default";
}

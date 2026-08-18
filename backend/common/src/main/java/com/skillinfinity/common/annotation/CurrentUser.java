package com.skillinfinity.common.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to inject the currently authenticated user into controller parameters.
 * <p>
 * Usage:
 * <pre>
 * &#64;GetMapping("/me")
 * public ResponseEntity&lt;UserResponse&gt; getCurrentUser(&#64;CurrentUser String userId) {
 *     // userId is automatically resolved from JWT token
 * }
 * </pre>
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {
}

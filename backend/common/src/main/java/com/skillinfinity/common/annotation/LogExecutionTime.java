package com.skillinfinity.common.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to log the execution time of a method.
 * <p>
 * When applied to a method, the execution duration is logged
 * at INFO level using SLF4J.
 * <p>
 * Usage:
 * <pre>
 * &#64;LogExecutionTime
 * public void processPayment(PaymentRequest request) {
 *     // method logic
 * }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogExecutionTime {
    String unit() default "ms";
}

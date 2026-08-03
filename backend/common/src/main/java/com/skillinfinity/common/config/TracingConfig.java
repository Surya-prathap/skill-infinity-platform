package com.skillinfinity.common.config;

import brave.Tracing;
import brave.handler.SpanHandler;
import brave.sampler.Sampler;
import brave.http.HttpTracing;
import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.brave.bridge.BraveBaggageManager;
import io.micrometer.tracing.brave.bridge.BraveCurrentTraceContext;
import io.micrometer.tracing.brave.bridge.BraveTracer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import zipkin2.Span;
import zipkin2.reporter.Reporter;

/**
 * Distributed tracing configuration using Micrometer Tracing with Brave/Zipkin.
 * Enables trace ID propagation across all microservices for end-to-end observability.
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "management.tracing.enabled", havingValue = "true", matchIfMissing = true)
public class TracingConfig {

    @Value("${spring.application.name:unknown}")
    private String serviceName;

    @Bean
    public Sampler zipkinSampler() {
        return Sampler.ALWAYS_SAMPLE;
    }

    @Bean
    public Reporter<Span> zipkinReporter() {
        log.info("Configuring Zipkin reporter: service={}", serviceName);
        return Reporter.NOOP;
    }

    @Bean
    public SpanHandler zipkinSpanHandler(Reporter<Span> reporter) {
        return SpanHandler.NOOP;
    }

    @Bean
    public Tracing tracing(SpanHandler spanHandler, Sampler sampler) {
        return Tracing.newBuilder()
                .localServiceName(serviceName)
                .addSpanHandler(spanHandler)
                .sampler(sampler)
                .build();
    }

    @Bean
    public HttpTracing httpTracing(Tracing tracing) {
        return HttpTracing.create(tracing);
    }

    @Bean
    public Tracer tracer(Tracing tracing) {
        return new BraveTracer(tracing.tracer(), new BraveCurrentTraceContext(tracing.currentTraceContext()),
                new BraveBaggageManager());
    }


}

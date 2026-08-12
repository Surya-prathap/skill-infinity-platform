package com.skillinfinity.admin.config;

import com.skillinfinity.common.util.RedisJsonSerializer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.LoggingCacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Redis is a cache, not a dependency: if a connection blip occurs (Lettuce
     * closing a pooled connection under memory/GC pressure), log the failure and
     * treat it as a cache miss — the {@code @Cacheable} method body runs and the
     * request still succeeds. Without this, one Redis hiccup turns every cached
     * endpoint into a 500 with a multi-second stall.
     */
    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new LoggingCacheErrorHandler();
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(RedisJsonSerializer.generic()))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withCacheConfiguration("dashboardStats",
                        config.entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration("platformSettings",
                        config.entryTtl(Duration.ofMinutes(15)))
                .withCacheConfiguration("featureFlags",
                        config.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("systemMetrics",
                        config.entryTtl(Duration.ofMinutes(3)))
                .withCacheConfiguration("analytics",
                        config.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("auditLogs",
                        config.entryTtl(Duration.ofMinutes(5)))
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(RedisJsonSerializer.generic());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(RedisJsonSerializer.generic());
        return template;
    }
}

package com.skillinfinity.common.util;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;

/**
 * Builds the Redis value serializer used for caching in every service.
 * <p>
 * The stock {@code GenericJackson2JsonRedisSerializer} used by default has two
 * problems on this platform:
 * <ol>
 *   <li>its internal mapper has no JSR-310 support, so caching any DTO that
 *       contains a {@code java.time.*} field (e.g. {@code LocalDateTime}) fails
 *       with "Java 8 date/time type ... not supported by default";</li>
 *   <li>when given a custom {@link ObjectMapper} (Spring Data Redis 3.2.x) it
 *       writes type hints asymmetrically (nested values only), so cached values
 *       fail to deserialize back into their DTOs.</li>
 * </ol>
 * Using a plain {@link Jackson2JsonRedisSerializer} with an explicitly
 * configured mapper makes serialization symmetric: the {@code JavaTimeModule}
 * handles dates (as ISO strings) and default typing embeds {@code @class}
 * hints so cached {@code PageResponse}/{@code LocalDateTime} DTOs round-trip
 * cleanly.
 */
public final class RedisJsonSerializer {

    private RedisJsonSerializer() {
    }

    public static RedisSerializer<Object> generic() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // EVERYTHING (not NON_FINAL): cached roots are often Java records
        // (e.g. PageResponse) which are final classes — NON_FINAL would skip them
        // and reads into Object.class would fail with "missing type id property".
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY);
        return new Jackson2JsonRedisSerializer<>(mapper, Object.class);
    }
}

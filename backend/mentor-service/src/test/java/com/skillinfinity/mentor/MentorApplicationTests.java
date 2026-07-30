package com.skillinfinity.mentor;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false"
})
@ActiveProfiles("test")
@Import(MentorApplicationTests.TestInfraMockConfig.class)
class MentorApplicationTests {

    @Test
    void contextLoads() {
    }

    @TestConfiguration
    static class TestInfraMockConfig {
        @Bean
        @Primary
        public CachingConnectionFactory cachingConnectionFactory() {
            CachingConnectionFactory ccf = new CachingConnectionFactory("localhost");
            ccf.setPort(5672);
            ccf.setConnectionTimeout(100);
            return ccf;
        }

        @Bean
        @Primary
        public RabbitTemplate rabbitTemplate(CachingConnectionFactory ccf) {
            return new RabbitTemplate(ccf);
        }

        @Bean
        @Primary
        public RedisConnectionFactory redisConnectionFactory() {
            LettuceConnectionFactory factory = new LettuceConnectionFactory("localhost", 6379);
            factory.setTimeout(java.time.Duration.ofMillis(100));
            return factory;
        }
    }
}


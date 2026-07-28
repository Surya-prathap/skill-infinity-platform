package com.skillinfinity.communication;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class CommunicationApplicationTest {

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private JavaMailSender mailSender;

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @Test
    void contextLoads() {
    }
}

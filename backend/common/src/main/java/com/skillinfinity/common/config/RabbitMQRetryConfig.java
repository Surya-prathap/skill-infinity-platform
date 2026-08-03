package com.skillinfinity.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.interceptor.RetryOperationsInterceptor;

/**
 * RabbitMQ retry and dead letter queue configuration.
 * Provides retry queues, DLQ, consumer acknowledgment, and publisher confirms.
 */
@Slf4j
@Configuration
public class RabbitMQRetryConfig {

    public static final String DLX_EXCHANGE = "skillinfinity.dlx";
    public static final String DLQ_QUEUE = "skillinfinity.dlq";
    public static final String DLQ_ROUTING_KEY = "skillinfinity.dlq.routing.key";
    public static final String RETRY_SUFFIX = ".retry";
    public static final String DLQ_SUFFIX = ".dlq";

    // ============================================================
    // Dead Letter Exchange (DLX)
    // ============================================================
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_QUEUE)
                .withArgument("x-queue-type", "classic")
                .build();
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with(DLQ_ROUTING_KEY);
    }

    // ============================================================
    // Message Converter
    // ============================================================
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ============================================================
    // Retry Interceptor
    // ============================================================
    @Bean
    public RetryOperationsInterceptor retryInterceptor() {
        return RetryInterceptorBuilder.stateless()
                .maxAttempts(3)
                .backOffOptions(1000, 2.0, 10000) // initial interval, multiplier, max interval
                .recoverer(new RejectAndDontRequeueRecoverer())
                .build();
    }

    // ============================================================
    // RabbitMQ Listener Container Factory with retry
    // ============================================================
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter,
            RetryOperationsInterceptor retryInterceptor) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAdviceChain(retryInterceptor);
        factory.setAcknowledgeMode(AcknowledgeMode.AUTO);
        factory.setPrefetchCount(10);
        factory.setDefaultRequeueRejected(false);
        factory.setMissingQueuesFatal(false);
        return factory;
    }

    // ============================================================
    // RabbitTemplate with publisher confirms
    // ============================================================
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        template.setConfirmCallback((correlationData, ack, cause) -> {
            if (ack) {
                log.debug("Message confirmed: {}", correlationData != null ? correlationData.getId() : "null");
            } else {
                log.warn("Message not confirmed: {}, cause: {}",
                        correlationData != null ? correlationData.getId() : "null", cause);
            }
        });
        template.setReturnsCallback(returned -> {
            log.warn("Message returned: exchange={}, routingKey={}, replyText={}, message={}",
                    returned.getExchange(), returned.getRoutingKey(),
                    returned.getReplyText(), returned.getMessage());
        });
        template.setMandatory(true);
        return template;
    }

    // ============================================================
    // Helper: Create a queue with DLQ binding
    // ============================================================
    public static Queue createRetryQueue(String mainQueueName) {
        String retryQueueName = mainQueueName + RETRY_SUFFIX;
        return QueueBuilder.durable(retryQueueName)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .withArgument("x-message-ttl", 30000) // 30 seconds TTL
                .withArgument("x-queue-type", "classic")
                .build();
    }

    public static Queue createRetryQueue(String mainQueueName, int ttlMs) {
        String retryQueueName = mainQueueName + RETRY_SUFFIX;
        return QueueBuilder.durable(retryQueueName)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .withArgument("x-message-ttl", ttlMs)
                .withArgument("x-queue-type", "classic")
                .build();
    }

    /**
     * Creates a queue configured with dead letter exchange.
     * When messages are rejected (after retries exhausted), they go to the DLQ.
     */
    public static Queue createQueueWithDLQ(String queueName) {
        return QueueBuilder.durable(queueName)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .withArgument("x-queue-type", "classic")
                .build();
    }
}

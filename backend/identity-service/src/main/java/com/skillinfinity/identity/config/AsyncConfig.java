package com.skillinfinity.identity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async execution for outbound events.
 *
 * <p>Identity event publishing (user.registered / user.updated to the
 * admin-service index) runs on a dedicated thread pool so a slow or
 * unavailable RabbitMQ broker can never block the register/login request
 * path — a publish used to add seconds to every registration when the broker
 * was under memory pressure.</p>
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "eventPublisherExecutor")
    public Executor eventPublisherExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("identity-event-pub-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.initialize();
        return executor;
    }
}

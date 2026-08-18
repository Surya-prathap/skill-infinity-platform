package com.skillinfinity.common.event;

import lombok.Getter;
import lombok.ToString;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Abstract base class for all domain events in the Skill Infinity platform.
 * <p>
 * Events are used for asynchronous communication between microservices via RabbitMQ.
 * All business events should extend this class.
 */
@Getter
@ToString
public abstract class BaseEvent implements Serializable {

    private final String eventId;
    private final String eventType;
    private final LocalDateTime occurredOn;
    private final String serviceName;

    protected BaseEvent(String eventType, String serviceName) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.occurredOn = LocalDateTime.now();
        this.serviceName = serviceName;
    }

    protected BaseEvent(String eventId, String eventType, LocalDateTime occurredOn, String serviceName) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.occurredOn = occurredOn;
        this.serviceName = serviceName;
    }
}

package com.skillinfinity.common.event;

import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Base class for domain events representing business operations.
 * Domain events carry business-specific payload data.
 */
@Getter
@ToString(callSuper = true)
public abstract class DomainEvent extends BaseEvent {

    private final String aggregateId;
    private final String aggregateType;
    private final int version;

    protected DomainEvent(String eventType, String serviceName,
                          String aggregateId, String aggregateType, int version) {
        super(eventType, serviceName);
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.version = version;
    }

    protected DomainEvent(String eventId, String eventType, LocalDateTime occurredOn,
                          String serviceName, String aggregateId,
                          String aggregateType, int version) {
        super(eventId, eventType, occurredOn, serviceName);
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.version = version;
    }
}

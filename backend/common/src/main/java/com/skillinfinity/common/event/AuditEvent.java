package com.skillinfinity.common.event;

import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Base class for audit events that track changes to domain entities.
 * Useful for logging and compliance purposes.
 */
@Getter
@ToString(callSuper = true)
public abstract class AuditEvent extends BaseEvent {

    private final String entityType;
    private final String entityId;
    private final String action;
    private final String changedBy;

    protected AuditEvent(String entityType, String entityId, String action,
                         String changedBy, String serviceName) {
        super("AUDIT_" + action.toUpperCase(), serviceName);
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.changedBy = changedBy;
    }

    protected AuditEvent(String eventId, String eventType, LocalDateTime occurredOn,
                         String serviceName, String entityType, String entityId,
                         String action, String changedBy) {
        super(eventId, eventType, occurredOn, serviceName);
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.changedBy = changedBy;
    }
}

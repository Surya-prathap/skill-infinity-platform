package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {

    List<CalendarEvent> findByUserId(UUID userId);

    List<CalendarEvent> findBySessionId(UUID sessionId);

    Optional<CalendarEvent> findBySessionIdAndUserId(UUID sessionId, UUID userId);

    List<CalendarEvent> findByProviderAndProviderEventId(String provider, String providerEventId);

    List<CalendarEvent> findByIsSyncedFalse();

    void deleteBySessionId(UUID sessionId);
}

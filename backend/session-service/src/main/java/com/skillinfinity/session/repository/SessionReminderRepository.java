package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.SessionReminder;
import com.skillinfinity.session.enumeration.ReminderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionReminderRepository extends JpaRepository<SessionReminder, UUID> {

    List<SessionReminder> findBySessionId(UUID sessionId);

    List<SessionReminder> findByRecipientId(UUID recipientId);

    @Query("SELECT r FROM SessionReminder r WHERE r.sent = false AND r.scheduledAt <= :now")
    List<SessionReminder> findPendingReminders(@Param("now") LocalDateTime now);

    long countBySessionIdAndSentTrue(UUID sessionId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM SessionReminder r WHERE r.sessionId = :sessionId AND r.reminderMinutesBefore = :minutesBefore AND r.type = :type")
    boolean existsBySessionIdAndReminderMinutes(@Param("sessionId") UUID sessionId,
                                                 @Param("minutesBefore") int minutesBefore,
                                                 @Param("type") ReminderType type);
}

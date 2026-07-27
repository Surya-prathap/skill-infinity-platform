package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.SessionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionHistoryRepository extends JpaRepository<SessionHistory, UUID> {

    List<SessionHistory> findBySessionIdOrderByPerformedAtDesc(UUID sessionId);

    List<SessionHistory> findByPerformedBy(UUID performedBy);

    long countBySessionId(UUID sessionId);
}

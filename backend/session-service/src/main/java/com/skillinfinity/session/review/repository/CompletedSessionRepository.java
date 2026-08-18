package com.skillinfinity.session.review.repository;

import com.skillinfinity.session.review.entity.CompletedSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompletedSessionRepository extends JpaRepository<CompletedSession, UUID> {

    Optional<CompletedSession> findBySessionId(UUID sessionId);

    boolean existsBySessionIdAndLearnerId(UUID sessionId, UUID learnerId);
}

package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.SessionFeedbackPlaceholder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionFeedbackPlaceholderRepository extends JpaRepository<SessionFeedbackPlaceholder, UUID> {

    List<SessionFeedbackPlaceholder> findBySessionId(UUID sessionId);

    Optional<SessionFeedbackPlaceholder> findBySessionIdAndFromUserId(UUID sessionId, UUID fromUserId);

    List<SessionFeedbackPlaceholder> findByToUserId(UUID toUserId);

    List<SessionFeedbackPlaceholder> findByFromUserIdAndIsSubmittedTrue(UUID fromUserId);

    long countBySessionIdAndIsSubmittedTrue(UUID sessionId);

    boolean existsBySessionIdAndFromUserId(UUID sessionId, UUID fromUserId);
}

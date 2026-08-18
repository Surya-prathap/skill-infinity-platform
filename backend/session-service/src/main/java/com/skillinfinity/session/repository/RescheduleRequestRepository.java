package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.RescheduleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RescheduleRequestRepository extends JpaRepository<RescheduleRequest, UUID> {

    List<RescheduleRequest> findBySessionIdOrderByCreatedAtDesc(UUID sessionId);

    Optional<RescheduleRequest> findTopBySessionIdOrderByCreatedAtDesc(UUID sessionId);

    List<RescheduleRequest> findByRequestedBy(UUID requestedBy);

    List<RescheduleRequest> findByStatus(String status);

    long countBySessionId(UUID sessionId);

    boolean existsBySessionIdAndStatus(UUID sessionId, String status);
}

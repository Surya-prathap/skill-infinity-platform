package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CancellationRepository extends JpaRepository<Cancellation, UUID> {

    Optional<Cancellation> findBySessionId(UUID sessionId);

    Optional<Cancellation> findByBookingId(UUID bookingId);

    boolean existsBySessionId(UUID sessionId);

    long countByCancelledBy(UUID cancelledBy);
}

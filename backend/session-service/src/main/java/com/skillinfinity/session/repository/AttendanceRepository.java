package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.Attendance;
import com.skillinfinity.session.enumeration.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    List<Attendance> findBySessionId(UUID sessionId);

    Optional<Attendance> findBySessionIdAndUserId(UUID sessionId, UUID userId);

    List<Attendance> findByUserId(UUID userId);

    long countBySessionIdAndStatus(UUID sessionId, AttendanceStatus status);

    long countBySessionId(UUID sessionId);

    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);
}

package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.SubscriptionHistory;
import com.skillinfinity.payment.enumeration.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionHistoryRepository extends JpaRepository<SubscriptionHistory, UUID> {

    Optional<SubscriptionHistory> findTopByUserIdAndStatusOrderByCreatedAtDesc(
            UUID userId, SubscriptionStatus status);

    Page<SubscriptionHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<SubscriptionHistory> findByStatusAndExpiresAtBefore(SubscriptionStatus status, LocalDateTime dateTime);

    long countByUserIdAndStatus(UUID userId, SubscriptionStatus status);
}

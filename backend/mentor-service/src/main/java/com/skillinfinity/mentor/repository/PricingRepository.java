package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, UUID> {

    List<Pricing> findByMentorIdOrderBySessionTypeAsc(UUID mentorId);

    Optional<Pricing> findByMentorIdAndSessionType(UUID mentorId, String sessionType);

    List<Pricing> findByMentorIdAndActiveTrue(UUID mentorId);
}

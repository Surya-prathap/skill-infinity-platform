package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.SubscriptionPlan;
import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {

    Optional<SubscriptionPlan> findByName(String name);

    List<SubscriptionPlan> findByIsActiveTrue();

    List<SubscriptionPlan> findByIsActiveTrueOrderByPriceAsc();

    List<SubscriptionPlan> findByTypeAndIsActiveTrueOrderByPriceAsc(SubscriptionPlanType type);
}

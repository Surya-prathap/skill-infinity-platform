package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.CreditPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditPackageRepository extends JpaRepository<CreditPackage, UUID> {

    Optional<CreditPackage> findByCode(String code);

    List<CreditPackage> findByIsActiveTrueOrderBySortOrderAsc();

    Optional<CreditPackage> findByCodeAndIsActiveTrue(String code);
}

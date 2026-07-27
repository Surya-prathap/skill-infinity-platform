package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.Tax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxRepository extends JpaRepository<Tax, UUID> {

    List<Tax> findByPaymentId(UUID paymentId);
}

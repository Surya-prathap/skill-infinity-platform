package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {

    List<PaymentMethod> findByUserId(UUID userId);

    List<PaymentMethod> findByUserIdAndIsActiveTrue(UUID userId);

    Optional<PaymentMethod> findByUserIdAndIsDefaultTrue(UUID userId);

    Optional<PaymentMethod> findByGatewayPaymentMethodId(String gatewayPaymentMethodId);
}

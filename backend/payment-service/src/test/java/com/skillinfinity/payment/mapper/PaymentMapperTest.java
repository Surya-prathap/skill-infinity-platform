package com.skillinfinity.payment.mapper;

import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
class PaymentMapperTest {

    @Autowired
    private PaymentMapper paymentMapper;

    @Test
    void toPaymentResponse_ShouldMapAllFields() {
        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .paymentNumber("PAY-20240101120000-0001")
                .status(PaymentStatus.COMPLETED)
                .amount(BigDecimal.valueOf(100.00))
                .currency("CREDITS")
                .credits(BigDecimal.valueOf(100.00))
                .gateway(PaymentGateway.INTERNAL)
                .gatewayPaymentId("pay_123")
                .description("Test payment")
                .discountAmount(BigDecimal.TEN)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(90.00))
                .paidAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        PaymentResponse response = paymentMapper.toPaymentResponse(payment);

        assertNotNull(response);
        assertEquals(payment.getId(), response.getId());
        assertEquals(payment.getUserId(), response.getUserId());
        assertEquals(payment.getPaymentNumber(), response.getPaymentNumber());
        assertEquals("COMPLETED", response.getStatus());
        assertEquals(payment.getAmount(), response.getAmount());
        assertEquals(payment.getCredits(), response.getCredits());
        assertEquals("INTERNAL", response.getGateway());
        assertEquals(payment.getDescription(), response.getDescription());
    }

    @Test
    void toPaymentResponse_ShouldHandleNullGateway() {
        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .paymentNumber("PAY-20240101120000-0002")
                .status(PaymentStatus.PENDING)
                .amount(BigDecimal.valueOf(50.00))
                .currency("CREDITS")
                .credits(BigDecimal.valueOf(50.00))
                .build();

        PaymentResponse response = paymentMapper.toPaymentResponse(payment);

        assertNotNull(response);
        assertNull(response.getGateway());
        assertEquals("PENDING", response.getStatus());
    }
}

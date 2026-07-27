package com.skillinfinity.payment.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.payment.dto.request.PaymentConfirmationRequest;
import com.skillinfinity.payment.dto.request.PaymentFailureRequest;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import com.skillinfinity.payment.event.PaymentEventPublisher;
import com.skillinfinity.payment.exception.DuplicateTransactionException;
import com.skillinfinity.payment.gateway.GatewayRegistry;
import com.skillinfinity.payment.gateway.InternalPaymentGateway;
import com.skillinfinity.payment.mapper.PaymentMapper;
import com.skillinfinity.payment.repository.InvoiceRepository;
import com.skillinfinity.payment.repository.PaymentAttemptRepository;
import com.skillinfinity.payment.repository.PaymentAuditRepository;
import com.skillinfinity.payment.repository.PaymentHistoryRepository;
import com.skillinfinity.payment.repository.PaymentRepository;
import com.skillinfinity.payment.repository.ReceiptRepository;
import com.skillinfinity.payment.service.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentAttemptRepository paymentAttemptRepository;
    @Mock
    private PaymentHistoryRepository paymentHistoryRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private ReceiptRepository receiptRepository;
    @Mock
    private PaymentAuditRepository paymentAuditRepository;
    @Mock
    private PaymentMapper paymentMapper;
    @Mock
    private PaymentEventPublisher eventPublisher;
    @Mock
    private GatewayRegistry gatewayRegistry;
    @Mock
    private CouponService couponService;

    private PaymentServiceImpl paymentService;
    private UUID userId;
    private UUID paymentId;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentServiceImpl(
                paymentRepository, paymentAttemptRepository, paymentHistoryRepository,
                invoiceRepository, receiptRepository, paymentAuditRepository,
                paymentMapper, eventPublisher, gatewayRegistry, couponService
        );
        userId = UUID.randomUUID();
        paymentId = UUID.randomUUID();
    }

    @Test
    void initiatePayment_ShouldCreatePayment() {
        PaymentRequest request = PaymentRequest.builder()
                .amount(BigDecimal.valueOf(100.00))
                .currency("CREDITS")
                .description("Test payment")
                .gateway("INTERNAL")
                .build();

        when(paymentRepository.existsByReferenceId(any())).thenReturn(false);
        when(gatewayRegistry.getStrategy(any(PaymentGateway.class)))
                .thenReturn(new InternalPaymentGateway());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(paymentId);
            return p;
        });
        when(paymentMapper.toPaymentResponse(any(Payment.class)))
                .thenReturn(PaymentResponse.builder().id(paymentId).build());

        PaymentResponse response = paymentService.initiatePayment(userId, request);

        assertNotNull(response);
        assertEquals(paymentId, response.getId());
        verify(paymentRepository).save(any(Payment.class));
        verify(eventPublisher).publishPaymentInitiated(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void initiatePayment_ShouldThrowOnDuplicateReference() {
        PaymentRequest request = PaymentRequest.builder()
                .amount(BigDecimal.valueOf(100.00))
                .referenceId("REF-001")
                .gateway("INTERNAL")
                .build();

        when(paymentRepository.existsByReferenceId("REF-001")).thenReturn(true);

        assertThrows(DuplicateTransactionException.class,
                () -> paymentService.initiatePayment(userId, request));
    }

    @Test
    void failPayment_ShouldUpdateStatus() {
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .status(PaymentStatus.INITIATED)
                .amount(BigDecimal.valueOf(100.00))
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentMapper.toPaymentResponse(any(Payment.class)))
                .thenReturn(PaymentResponse.builder().id(paymentId).status("FAILED").build());

        PaymentFailureRequest request = PaymentFailureRequest.builder()
                .paymentId(paymentId.toString())
                .failureReason("Insufficient funds")
                .failureCode("INSUFFICIENT_FUNDS")
                .build();

        PaymentResponse response = paymentService.failPayment(userId, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertEquals("Insufficient funds", payment.getFailureReason());
        verify(eventPublisher).publishPaymentFailed(any(), any(), any(), any(), any(), any());
    }

    @Test
    void getPaymentById_ShouldReturnPayment_WhenOwnedByUser() {
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .amount(BigDecimal.valueOf(100.00))
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentMapper.toPaymentResponse(any(Payment.class)))
                .thenReturn(PaymentResponse.builder().id(paymentId).build());

        PaymentResponse response = paymentService.getPaymentById(userId, paymentId);

        assertNotNull(response);
        assertEquals(paymentId, response.getId());
    }

    @Test
    void getPaymentById_ShouldThrow_WhenNotOwnedByUser() {
        UUID otherUserId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(otherUserId)
                .amount(BigDecimal.valueOf(100.00))
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        assertThrows(com.skillinfinity.common.exception.BadRequestException.class,
                () -> paymentService.getPaymentById(userId, paymentId));
    }
}

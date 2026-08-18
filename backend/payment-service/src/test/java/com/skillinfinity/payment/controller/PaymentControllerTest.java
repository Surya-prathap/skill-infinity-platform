package com.skillinfinity.payment.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.payment.dto.request.PaymentConfirmationRequest;
import com.skillinfinity.payment.dto.request.PaymentFailureRequest;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.request.RefundRequest;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.service.CouponService;
import com.skillinfinity.payment.service.PaymentService;
import com.skillinfinity.payment.service.RefundService;
import com.skillinfinity.payment.service.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(PaymentController.class)
@Import(PaymentControllerTest.TestSecurityConfig.class)
class PaymentControllerTest {

    @EnableWebSecurity
    static class TestSecurityConfig {
        @org.springframework.context.annotation.Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private RefundService refundService;

    @MockBean
    private SubscriptionService subscriptionService;

    @MockBean
    private CouponService couponService;

    @Test
    void initiatePayment_ShouldReturn201() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .id(UUID.randomUUID())
                .status("INITIATED")
                .amount(BigDecimal.valueOf(100.00))
                .currency("CREDITS")
                .build();

        when(paymentService.initiatePayment(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments")
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":100.00,\"currency\":\"CREDITS\",\"gateway\":\"INTERNAL\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INITIATED"));
    }

    @Test
    void initiatePayment_ShouldReturn400_WhenAmountMissing() throws Exception {
        mockMvc.perform(post("/api/v1/payments")
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currency\":\"CREDITS\",\"gateway\":\"INTERNAL\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void confirmPayment_ShouldReturn200() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .id(UUID.randomUUID())
                .status("COMPLETED")
                .build();

        when(paymentService.confirmPayment(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/confirm")
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentId\":\"" + UUID.randomUUID() + "\",\"gatewayPaymentId\":\"pay_123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void failPayment_ShouldReturn200() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .id(UUID.randomUUID())
                .status("FAILED")
                .build();

        when(paymentService.failPayment(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/fail")
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentId\":\"" + UUID.randomUUID() + "\",\"failureReason\":\"Insufficient funds\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getPaymentHistory_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/payments/history")
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk());
    }

    @Test
    void getPaymentById_ShouldReturn200() throws Exception {
        UUID paymentId = UUID.randomUUID();
        PaymentResponse response = PaymentResponse.builder()
                .id(paymentId)
                .status("COMPLETED")
                .build();

        when(paymentService.getPaymentById(any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/payments/{id}", paymentId)
                        .header("X-User-ID", UUID.randomUUID().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void requestRefund_ShouldReturn200() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .id(UUID.randomUUID())
                .status("REFUNDED")
                .build();

        when(refundService.requestRefund(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/refund")
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentId\":\"" + UUID.randomUUID() + "\",\"amount\":50.00,\"reason\":\"Test refund\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

package com.skillinfinity.wallet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.wallet.dto.request.CreditRequest;
import com.skillinfinity.wallet.dto.request.DebitRequest;
import com.skillinfinity.wallet.dto.request.FreezeRequest;
import com.skillinfinity.wallet.dto.request.WalletRequest;
import com.skillinfinity.wallet.dto.response.TransactionResponse;
import com.skillinfinity.wallet.dto.response.WalletBalanceResponse;
import com.skillinfinity.wallet.dto.response.WalletResponse;
import com.skillinfinity.wallet.dto.response.WalletAuditResponse;
import com.skillinfinity.wallet.dto.response.WalletStatisticsResponse;
import com.skillinfinity.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WalletController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WalletService walletService;

    @Test
    void createWallet_ShouldReturn201() throws Exception {
        UUID userId = UUID.randomUUID();
        WalletRequest request = WalletRequest.builder()
                .userId(userId)
                .build();

        WalletResponse response = WalletResponse.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .walletNumber("WAL-20240101-000001")
                .status("ACTIVE")
                .build();

        when(walletService.createWallet(any(WalletRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/wallet")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Wallet created successfully"));
    }

    @Test
    void getWallet_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        WalletResponse response = WalletResponse.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .walletNumber("WAL-20240101-000001")
                .status("ACTIVE")
                .build();

        when(walletService.getWalletByUserId(any(UUID.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/wallet")
                        .header("X-User-ID", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getBalance_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        WalletBalanceResponse response = WalletBalanceResponse.builder()
                .id(UUID.randomUUID())
                .currentBalance(BigDecimal.valueOf(500))
                .availableBalance(BigDecimal.valueOf(450))
                .frozenBalance(BigDecimal.valueOf(50))
                .currency("CREDITS")
                .build();

        when(walletService.getWalletBalance(any(UUID.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/wallet/balance")
                        .header("X-User-ID", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currentBalance").value(500));
    }

    @Test
    void creditWallet_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        CreditRequest request = CreditRequest.builder()
                .amount(BigDecimal.valueOf(100))
                .description("Credit purchase")
                .build();

        TransactionResponse response = TransactionResponse.builder()
                .id(UUID.randomUUID())
                .transactionNumber("TXN-20240101-0001")
                .amount(BigDecimal.valueOf(100))
                .status("COMPLETED")
                .build();

        when(walletService.creditWallet(any(UUID.class), any(CreditRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/wallet/credit")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Credits added successfully"));
    }

    @Test
    void debitWallet_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        DebitRequest request = DebitRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .description("Session payment")
                .build();

        TransactionResponse response = TransactionResponse.builder()
                .id(UUID.randomUUID())
                .transactionNumber("TXN-20240101-0002")
                .amount(BigDecimal.valueOf(50))
                .status("COMPLETED")
                .build();

        when(walletService.debitWallet(any(UUID.class), any(DebitRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/wallet/debit")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Credits deducted successfully"));
    }

    @Test
    void freezeCredits_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        FreezeRequest request = FreezeRequest.builder()
                .amount(BigDecimal.valueOf(100))
                .reason("Dispute")
                .build();

        TransactionResponse response = TransactionResponse.builder()
                .id(UUID.randomUUID())
                .status("COMPLETED")
                .build();

        when(walletService.freezeCredits(any(UUID.class), any(UUID.class), any(FreezeRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/wallet/freeze")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void releaseCredits_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        FreezeRequest request = FreezeRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .reason("Resolved")
                .build();

        TransactionResponse response = TransactionResponse.builder()
                .id(UUID.randomUUID())
                .status("COMPLETED")
                .build();

        when(walletService.releaseCredits(any(UUID.class), any(UUID.class), any(FreezeRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/wallet/release")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getHistory_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        PageResponse<TransactionResponse> response = PageResponse.of(
                List.of(), 0, 20, 0);

        when(walletService.getWalletHistory(any(UUID.class), anyInt(), anyInt())).thenReturn(response);

        mockMvc.perform(get("/api/v1/wallet/history")
                        .header("X-User-ID", userId.toString())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getStatement_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        PageResponse<TransactionResponse> response = PageResponse.of(
                List.of(), 0, 20, 0);

        when(walletService.getWalletStatement(any(UUID.class), any(LocalDate.class),
                any(LocalDate.class), anyInt(), anyInt())).thenReturn(response);

        mockMvc.perform(get("/api/v1/wallet/statement")
                        .header("X-User-ID", userId.toString())
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-12-31")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getAuditLog_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        PageResponse<WalletAuditResponse> response = PageResponse.of(
                List.of(), 0, 20, 0);

        when(walletService.getWalletAuditLog(any(UUID.class), anyInt(), anyInt())).thenReturn(response);

        mockMvc.perform(get("/api/v1/wallet/audit")
                        .header("X-User-ID", userId.toString())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getStatistics_ShouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        WalletStatisticsResponse response = WalletStatisticsResponse.builder()
                .id(UUID.randomUUID())
                .totalTransactions(100)
                .successfulTransactions(95)
                .totalCreditsIn(BigDecimal.valueOf(10000))
                .totalCreditsOut(BigDecimal.valueOf(5000))
                .build();

        when(walletService.getWalletStatistics(any(UUID.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/wallet/statistics")
                        .header("X-User-ID", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTransactions").value(100));
    }

    @Test
    void creditWallet_WithInvalidAmount_ShouldReturn400() throws Exception {
        UUID userId = UUID.randomUUID();
        CreditRequest request = CreditRequest.builder()
                .amount(BigDecimal.valueOf(0))
                .description("Invalid")
                .build();

        mockMvc.perform(post("/api/v1/wallet/credit")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void debitWallet_WithNegativeAmount_ShouldReturn400() throws Exception {
        UUID userId = UUID.randomUUID();
        DebitRequest request = DebitRequest.builder()
                .amount(BigDecimal.valueOf(-10))
                .description("Invalid")
                .build();

        mockMvc.perform(post("/api/v1/wallet/debit")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

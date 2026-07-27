package com.skillinfinity.wallet.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.wallet.dto.request.CreditRequest;
import com.skillinfinity.wallet.dto.request.DebitRequest;
import com.skillinfinity.wallet.dto.request.FreezeRequest;
import com.skillinfinity.wallet.dto.request.WalletRequest;
import com.skillinfinity.wallet.dto.response.LedgerEntryResponse;
import com.skillinfinity.wallet.dto.response.RewardResponse;
import com.skillinfinity.wallet.dto.response.TransactionResponse;
import com.skillinfinity.wallet.dto.response.WalletAuditResponse;
import com.skillinfinity.wallet.dto.response.WalletBalanceResponse;
import com.skillinfinity.wallet.dto.response.WalletResponse;
import com.skillinfinity.wallet.dto.response.WalletStatisticsResponse;
import com.skillinfinity.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet Management", description = "Credit wallet, balance, transactions, rewards, and financial management")
public class WalletController {

    private final WalletService walletService;

    @PostMapping
    @Operation(summary = "Create wallet", description = "Creates a new credit wallet for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Wallet created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Wallet already exists or invalid input")
    })
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody WalletRequest request) {
        log.info("Create wallet request for user: {}", userId);
        WalletResponse response = walletService.createWallet(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Wallet created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get wallet details", description = "Returns wallet details for the authenticated user")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @RequestHeader("X-User-ID") UUID userId) {
        WalletResponse response = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/balance")
    @Operation(summary = "Get wallet balance", description = "Returns the current credit balance for the authenticated user")
    public ResponseEntity<ApiResponse<WalletBalanceResponse>> getBalance(
            @RequestHeader("X-User-ID") UUID userId) {
        WalletBalanceResponse response = walletService.getWalletBalance(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/credit")
    @Operation(summary = "Credit wallet", description = "Adds credits to the authenticated user's wallet")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Credits added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid amount or duplicate transaction"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Wallet is frozen or suspended")
    })
    public ResponseEntity<ApiResponse<TransactionResponse>> creditWallet(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CreditRequest request) {
        log.info("Credit wallet request for user: {}, amount: {}", userId, request.getAmount());
        TransactionResponse response = walletService.creditWallet(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Credits added successfully", response));
    }

    @PostMapping("/debit")
    @Operation(summary = "Debit wallet", description = "Deducts credits from the authenticated user's wallet")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Credits deducted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Insufficient balance or invalid amount"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Wallet is frozen or suspended")
    })
    public ResponseEntity<ApiResponse<TransactionResponse>> debitWallet(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody DebitRequest request) {
        log.info("Debit wallet request for user: {}, amount: {}", userId, request.getAmount());
        TransactionResponse response = walletService.debitWallet(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Credits deducted successfully", response));
    }

    @PostMapping("/freeze")
    @Operation(summary = "Freeze credits", description = "Freezes a specified amount of credits in the wallet")
    public ResponseEntity<ApiResponse<TransactionResponse>> freezeCredits(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody FreezeRequest request) {
        log.info("Freeze credits request for user: {}, amount: {}", userId, request.getAmount());
        TransactionResponse response = walletService.freezeCredits(userId, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Credits frozen successfully", response));
    }

    @PostMapping("/release")
    @Operation(summary = "Release credits", description = "Releases frozen credits back to available balance")
    public ResponseEntity<ApiResponse<TransactionResponse>> releaseCredits(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody FreezeRequest request) {
        log.info("Release credits request for user: {}, amount: {}", userId, request.getAmount());
        TransactionResponse response = walletService.releaseCredits(userId, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Credits released successfully", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get wallet history", description = "Returns paginated transaction history for the authenticated user")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getHistory(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<TransactionResponse> response = walletService.getWalletHistory(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/statement")
    @Operation(summary = "Get wallet statement", description = "Returns paginated transaction statement for a date range")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getStatement(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<TransactionResponse> response = walletService.getWalletStatement(userId, startDate, endDate, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get wallet statistics", description = "Returns aggregated wallet statistics for the authenticated user")
    public ResponseEntity<ApiResponse<WalletStatisticsResponse>> getStatistics(
            @RequestHeader("X-User-ID") UUID userId) {
        WalletStatisticsResponse response = walletService.getWalletStatistics(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/audit")
    @Operation(summary = "Get wallet audit log", description = "Returns paginated audit log for the authenticated user's wallet")
    public ResponseEntity<ApiResponse<PageResponse<WalletAuditResponse>>> getAuditLog(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<WalletAuditResponse> response = walletService.getWalletAuditLog(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

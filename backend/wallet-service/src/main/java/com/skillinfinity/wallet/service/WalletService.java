package com.skillinfinity.wallet.service;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.wallet.dto.request.CreditRequest;
import com.skillinfinity.wallet.dto.request.DebitRequest;
import com.skillinfinity.wallet.dto.request.FreezeRequest;
import com.skillinfinity.wallet.dto.request.WalletRequest;
import com.skillinfinity.wallet.dto.request.WithdrawalRequestDto;
import com.skillinfinity.wallet.dto.response.TransactionResponse;
import com.skillinfinity.wallet.dto.response.WalletAuditResponse;
import com.skillinfinity.wallet.dto.response.WalletBalanceResponse;
import com.skillinfinity.wallet.dto.response.WalletResponse;
import com.skillinfinity.wallet.dto.response.WalletStatisticsResponse;
import com.skillinfinity.wallet.dto.response.WithdrawalResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface WalletService {

    WalletResponse createWallet(WalletRequest request);

    WalletResponse getWalletByUserId(UUID userId);

    WalletResponse getWalletById(UUID walletId);

    WalletBalanceResponse getWalletBalance(UUID userId);

    TransactionResponse creditWallet(UUID userId, CreditRequest request);

    TransactionResponse debitWallet(UUID userId, DebitRequest request);

    TransactionResponse freezeCredits(UUID userId, UUID walletId, FreezeRequest request);

    TransactionResponse releaseCredits(UUID userId, UUID walletId, FreezeRequest request);

    /** User-scoped freeze/release used by session-service booking holds. */
    TransactionResponse freezeByUser(UUID userId, FreezeRequest request);

    TransactionResponse releaseByUser(UUID userId, FreezeRequest request);

    /**
     * Settles a completed professional session: converts the learner's frozen
     * hold into a real debit (WELCOME → PURCHASED → LEARNING priority) and
     * credits the mentor's learning + withdrawable buckets per the configured
     * split. No-op for community (free) sessions.
     */
    void settleSessionCredits(UUID sessionId, UUID learnerId, UUID mentorId, BigDecimal credits, boolean community);

    // Withdrawals
    WithdrawalResponse requestWithdrawal(UUID userId, WithdrawalRequestDto request);

    PageResponse<WithdrawalResponse> getMyWithdrawals(UUID userId, int page, int size);

    PageResponse<WithdrawalResponse> getAllWithdrawals(int page, int size);

    WithdrawalResponse approveWithdrawal(UUID withdrawalId, UUID adminId);

    WithdrawalResponse rejectWithdrawal(UUID withdrawalId, UUID adminId, String reason);

    PageResponse<TransactionResponse> getWalletHistory(UUID userId, int page, int size);

    PageResponse<TransactionResponse> getWalletStatement(UUID userId, LocalDate startDate, LocalDate endDate, int page, int size);

    WalletStatisticsResponse getWalletStatistics(UUID userId);

    PageResponse<WalletAuditResponse> getWalletAuditLog(UUID userId, int page, int size);
}

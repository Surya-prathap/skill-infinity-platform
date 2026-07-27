package com.skillinfinity.wallet.service;

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

    PageResponse<TransactionResponse> getWalletHistory(UUID userId, int page, int size);

    PageResponse<TransactionResponse> getWalletStatement(UUID userId, LocalDate startDate, LocalDate endDate, int page, int size);

    PageResponse<LedgerEntryResponse> getWalletLedger(UUID userId, int page, int size);

    PageResponse<RewardResponse> getRewards(UUID userId, int page, int size);

    WalletStatisticsResponse getWalletStatistics(UUID userId);

    PageResponse<WalletAuditResponse> getWalletAuditLog(UUID userId, int page, int size);
}

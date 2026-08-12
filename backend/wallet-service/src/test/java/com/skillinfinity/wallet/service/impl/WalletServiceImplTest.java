package com.skillinfinity.wallet.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.wallet.dto.request.CreditRequest;
import com.skillinfinity.wallet.dto.request.DebitRequest;
import com.skillinfinity.wallet.dto.request.FreezeRequest;
import com.skillinfinity.wallet.dto.request.WalletRequest;
import com.skillinfinity.wallet.dto.response.LedgerEntryResponse;
import com.skillinfinity.wallet.dto.response.RewardResponse;
import com.skillinfinity.wallet.dto.response.TransactionResponse;
import com.skillinfinity.wallet.dto.response.WalletBalanceResponse;
import com.skillinfinity.wallet.dto.response.WalletResponse;
import com.skillinfinity.wallet.dto.response.WalletAuditResponse;
import com.skillinfinity.wallet.dto.response.WalletStatisticsResponse;
import com.skillinfinity.wallet.entity.CreditTransaction;
import com.skillinfinity.wallet.entity.Reward;
import com.skillinfinity.wallet.entity.Wallet;
import com.skillinfinity.wallet.entity.WalletAudit;
import com.skillinfinity.wallet.entity.WalletBalance;
import com.skillinfinity.wallet.entity.WalletLedger;
import com.skillinfinity.wallet.entity.WalletStatistics;
import com.skillinfinity.wallet.enumeration.TransactionStatus;
import com.skillinfinity.wallet.enumeration.TransactionType;
import com.skillinfinity.wallet.enumeration.WalletStatus;
import com.skillinfinity.wallet.event.WalletEventPublisher;
import com.skillinfinity.wallet.exception.DuplicateTransactionException;
import com.skillinfinity.wallet.exception.InsufficientBalanceException;
import com.skillinfinity.wallet.exception.WalletFrozenException;
import com.skillinfinity.wallet.exception.WalletNotFoundException;
import com.skillinfinity.wallet.mapper.WalletMapper;
import com.skillinfinity.wallet.repository.BonusCreditRepository;
import com.skillinfinity.wallet.repository.CouponRedemptionRepository;
import com.skillinfinity.wallet.repository.CreditTransactionRepository;
import com.skillinfinity.wallet.repository.ReferralRewardRepository;
import com.skillinfinity.wallet.repository.RewardRepository;
import com.skillinfinity.wallet.repository.WalletAuditRepository;
import com.skillinfinity.wallet.repository.WalletBalanceRepository;
import com.skillinfinity.wallet.repository.WalletLedgerRepository;
import com.skillinfinity.wallet.repository.WalletRepository;
import com.skillinfinity.wallet.repository.WalletStatisticsRepository;
import com.skillinfinity.wallet.repository.WithdrawalRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceImplTest {

    @Mock
    private WalletRepository walletRepository;
    @Mock
    private WalletBalanceRepository walletBalanceRepository;
    @Mock
    private CreditTransactionRepository creditTransactionRepository;
    @Mock
    private WalletLedgerRepository walletLedgerRepository;
    @Mock
    private RewardRepository rewardRepository;
    @Mock
    private WalletAuditRepository walletAuditRepository;
    @Mock
    private WalletStatisticsRepository walletStatisticsRepository;
    @Mock
    private WithdrawalRequestRepository withdrawalRequestRepository;
    @Mock
    private WalletMapper walletMapper;
    @Mock
    private WalletEventPublisher eventPublisher;

    @Captor
    private ArgumentCaptor<Wallet> walletCaptor;
    @Captor
    private ArgumentCaptor<WalletBalance> balanceCaptor;
    @Captor
    private ArgumentCaptor<CreditTransaction> transactionCaptor;
    @Captor
    private ArgumentCaptor<WalletLedger> ledgerCaptor;
    @Captor
    private ArgumentCaptor<WalletAudit> auditCaptor;
    @Captor
    private ArgumentCaptor<WalletStatistics> statisticsCaptor;

    private WalletServiceImpl walletService;

    private UUID userId;
    private UUID walletId;
    private Wallet wallet;
    private WalletBalance balance;
    private WalletStatistics statistics;
    private CreditTransaction transaction;
    private WalletResponse walletResponse;
    private WalletBalanceResponse balanceResponse;
    private TransactionResponse transactionResponse;
    private WalletStatisticsResponse statisticsResponse;
    private WalletAuditResponse auditResponse;

    @BeforeEach
    void setUp() {
        walletService = new WalletServiceImpl(
                walletRepository, walletBalanceRepository, creditTransactionRepository,
                walletLedgerRepository, rewardRepository,
                walletAuditRepository, walletStatisticsRepository,
                withdrawalRequestRepository,
                walletMapper, eventPublisher
        );

        userId = UUID.randomUUID();
        walletId = UUID.randomUUID();

        wallet = Wallet.builder()
                .id(walletId)
                .userId(userId)
                .walletNumber("WAL-20240101-000001")
                .status(WalletStatus.ACTIVE)
                .totalCreditsPurchased(BigDecimal.ZERO)
                .totalCreditsSpent(BigDecimal.ZERO)
                .totalCreditsEarned(BigDecimal.ZERO)
                .frozenAmount(BigDecimal.ZERO)
                .build();

        balance = WalletBalance.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .currentBalance(BigDecimal.valueOf(500))
                .availableBalance(BigDecimal.valueOf(450))
                .frozenBalance(BigDecimal.valueOf(50))
                .pendingBalance(BigDecimal.ZERO)
                .currency("CREDITS")
                .build();

        statistics = WalletStatistics.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .build();

        transaction = CreditTransaction.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .transactionNumber("TXN-20240101-0001")
                .transactionType(TransactionType.CREDIT_PURCHASE)
                .status(TransactionStatus.COMPLETED)
                .amount(BigDecimal.valueOf(100))
                .balanceBefore(BigDecimal.valueOf(500))
                .balanceAfter(BigDecimal.valueOf(600))
                .currency("CREDITS")
                .description("Test credit")
                .build();

        walletResponse = WalletResponse.builder()
                .id(walletId)
                .userId(userId)
                .walletNumber("WAL-20240101-000001")
                .status("ACTIVE")
                .build();

        balanceResponse = WalletBalanceResponse.builder()
                .id(balance.getId())
                .currentBalance(BigDecimal.valueOf(500))
                .availableBalance(BigDecimal.valueOf(450))
                .frozenBalance(BigDecimal.valueOf(50))
                .currency("CREDITS")
                .build();

        transactionResponse = TransactionResponse.builder()
                .id(transaction.getId())
                .transactionNumber("TXN-20240101-0001")
                .transactionType("CREDIT_PURCHASE")
                .status("COMPLETED")
                .amount(BigDecimal.valueOf(100))
                .build();

        statisticsResponse = WalletStatisticsResponse.builder()
                .id(statistics.getId())
                .totalTransactions(0)
                .successfulTransactions(0)
                .build();

        auditResponse = WalletAuditResponse.builder()
                .id(UUID.randomUUID())
                .action("WALLET_CREATED")
                .description("Wallet created")
                .build();
    }

    // ============================================================
    // Create Wallet Tests
    // ============================================================

    @Test
    void shouldCreateWalletSuccessfully() {
        WalletRequest request = WalletRequest.builder()
                .userId(userId)
                .createdBy(userId.toString())
                .build();

        when(walletRepository.existsByUserId(userId)).thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenAnswer(i -> {
            Wallet saved = i.getArgument(0);
            if (saved.getId() == null) saved.setId(walletId);
            return saved;
        });
        when(walletBalanceRepository.save(any(WalletBalance.class))).thenAnswer(i -> i.getArgument(0));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(walletStatisticsRepository.save(any(WalletStatistics.class))).thenAnswer(i -> i.getArgument(0));
        when(walletAuditRepository.save(any(WalletAudit.class))).thenAnswer(i -> i.getArgument(0));
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));
        when(walletStatisticsRepository.findByWalletId(walletId)).thenReturn(Optional.of(statistics));
        when(walletMapper.toWalletResponse(any(Wallet.class))).thenReturn(walletResponse);

        WalletResponse result = walletService.createWallet(request);

        assertNotNull(result);
        assertEquals(walletId, result.getId());
        verify(walletRepository, atLeastOnce()).save(any(Wallet.class));
        verify(walletBalanceRepository, atLeastOnce()).save(any(WalletBalance.class));
        verify(walletStatisticsRepository, atLeastOnce()).save(any(WalletStatistics.class));
        verify(walletAuditRepository, atLeastOnce()).save(any(WalletAudit.class));
    }

    @Test
    void shouldGrantWelcomeCreditsOnWalletCreation() {
        balance.setCurrentBalance(BigDecimal.ZERO);
        balance.setAvailableBalance(BigDecimal.ZERO);
        WalletRequest request = WalletRequest.builder()
                .userId(userId)
                .createdBy(userId.toString())
                .build();

        when(walletRepository.existsByUserId(userId)).thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenAnswer(i -> {
            Wallet saved = i.getArgument(0);
            if (saved.getId() == null) saved.setId(walletId);
            return saved;
        });
        when(walletBalanceRepository.save(any(WalletBalance.class))).thenAnswer(i -> i.getArgument(0));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(walletStatisticsRepository.save(any(WalletStatistics.class))).thenAnswer(i -> i.getArgument(0));
        when(walletAuditRepository.save(any(WalletAudit.class))).thenAnswer(i -> i.getArgument(0));
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));
        when(walletStatisticsRepository.findByWalletId(walletId)).thenReturn(Optional.of(statistics));
        when(walletMapper.toWalletResponse(any(Wallet.class))).thenReturn(walletResponse);

        walletService.createWallet(request);

        verify(creditTransactionRepository, atLeastOnce()).save(transactionCaptor.capture());
        CreditTransaction welcomeTransaction = transactionCaptor.getValue();
        assertEquals(TransactionType.PROMOTIONAL_CREDIT, welcomeTransaction.getTransactionType());
        assertEquals(BigDecimal.valueOf(3), welcomeTransaction.getAmount());
        assertEquals("WELCOME_CREDITS", welcomeTransaction.getReferenceType());

        verify(walletBalanceRepository, atLeastOnce()).save(balanceCaptor.capture());
        WalletBalance savedBalance = balanceCaptor.getValue();
        assertEquals(BigDecimal.valueOf(3), savedBalance.getCurrentBalance());
        assertEquals(BigDecimal.valueOf(3), savedBalance.getAvailableBalance());
    }

    @Test
    void shouldThrowExceptionWhenWalletAlreadyExists() {
        WalletRequest request = WalletRequest.builder()
                .userId(userId)
                .build();

        when(walletRepository.existsByUserId(userId)).thenReturn(true);

        assertThrows(BadRequestException.class, () ->
                walletService.createWallet(request));
    }

    // ============================================================
    // Get Wallet Tests
    // ============================================================

    @Test
    void shouldGetWalletByUserId() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletMapper.toWalletResponse(wallet)).thenReturn(walletResponse);

        WalletResponse result = walletService.getWalletByUserId(userId);

        assertNotNull(result);
        assertEquals(walletId, result.getId());
    }

    @Test
    void shouldThrowExceptionWhenWalletNotFoundByUserId() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(WalletNotFoundException.class, () ->
                walletService.getWalletByUserId(userId));
    }

    @Test
    void shouldGetWalletById() {
        when(walletRepository.findById(walletId)).thenReturn(Optional.of(wallet));
        when(walletMapper.toWalletResponse(wallet)).thenReturn(walletResponse);

        WalletResponse result = walletService.getWalletById(walletId);

        assertNotNull(result);
        assertEquals(walletId, result.getId());
    }

    @Test
    void shouldThrowExceptionWhenWalletNotFoundById() {
        when(walletRepository.findById(walletId)).thenReturn(Optional.empty());

        assertThrows(WalletNotFoundException.class, () ->
                walletService.getWalletById(walletId));
    }

    // ============================================================
    // Get Balance Tests
    // ============================================================

    @Test
    void shouldGetWalletBalance() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(walletMapper.toBalanceResponse(balance)).thenReturn(balanceResponse);

        WalletBalanceResponse result = walletService.getWalletBalance(userId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(500), result.getCurrentBalance());
        assertEquals(BigDecimal.valueOf(450), result.getAvailableBalance());
    }

    // ============================================================
    // Credit Wallet Tests
    // ============================================================

    @Test
    void shouldCreditWalletSuccessfully() {
        CreditRequest request = CreditRequest.builder()
                .amount(BigDecimal.valueOf(100))
                .description("Credit test")
                .referenceId("REF-001")
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(creditTransactionRepository.existsByReferenceId("REF-001")).thenReturn(false);
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));
        when(walletAuditRepository.save(any(WalletAudit.class))).thenAnswer(i -> i.getArgument(0));
        when(walletStatisticsRepository.findByWalletId(walletId)).thenReturn(Optional.of(statistics));
        when(walletMapper.toTransactionResponse(any(CreditTransaction.class))).thenReturn(transactionResponse);

        TransactionResponse result = walletService.creditWallet(userId, request);

        assertNotNull(result);
        verify(creditTransactionRepository, times(1)).save(any(CreditTransaction.class));
        verify(walletLedgerRepository, times(1)).save(any(WalletLedger.class));
        verify(walletAuditRepository, times(1)).save(any(WalletAudit.class));
        verify(walletBalanceRepository, times(1)).save(any(WalletBalance.class));
        verify(walletRepository, times(1)).save(any(Wallet.class));
        verify(eventPublisher, times(1)).publishWalletCredited(
                any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void shouldThrowExceptionWhenDuplicateReference() {
        CreditRequest request = CreditRequest.builder()
                .amount(BigDecimal.valueOf(100))
                .description("Credit test")
                .referenceId("DUP-REF")
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(creditTransactionRepository.existsByReferenceId("DUP-REF")).thenReturn(true);

        assertThrows(DuplicateTransactionException.class, () ->
                walletService.creditWallet(userId, request));
    }

    @Test
    void shouldThrowExceptionWhenWalletFrozen() {
        wallet.setStatus(WalletStatus.FROZEN);
        CreditRequest request = CreditRequest.builder()
                .amount(BigDecimal.valueOf(100))
                .description("Credit test")
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        assertThrows(WalletFrozenException.class, () ->
                walletService.creditWallet(userId, request));
    }

    // ============================================================
    // Debit Wallet Tests
    // ============================================================

    @Test
    void shouldDebitWalletSuccessfully() {
        DebitRequest request = DebitRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .description("Debit test")
                .referenceId("DEB-001")
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));
        when(walletAuditRepository.save(any(WalletAudit.class))).thenAnswer(i -> i.getArgument(0));
        when(walletStatisticsRepository.findByWalletId(walletId)).thenReturn(Optional.of(statistics));
        when(walletMapper.toTransactionResponse(any(CreditTransaction.class))).thenReturn(transactionResponse);

        TransactionResponse result = walletService.debitWallet(userId, request);

        assertNotNull(result);
        verify(creditTransactionRepository, times(1)).save(any(CreditTransaction.class));
        verify(walletLedgerRepository, times(1)).save(any(WalletLedger.class));
        verify(walletAuditRepository, times(1)).save(any(WalletAudit.class));
        verify(walletBalanceRepository, times(1)).save(any(WalletBalance.class));
        verify(eventPublisher, times(1)).publishWalletDebited(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void shouldThrowExceptionWhenInsufficientBalance() {
        balance.setCurrentBalance(BigDecimal.valueOf(10));
        balance.setAvailableBalance(BigDecimal.valueOf(10));

        DebitRequest request = DebitRequest.builder()
                .amount(BigDecimal.valueOf(100))
                .description("Debit test")
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));

        assertThrows(InsufficientBalanceException.class, () ->
                walletService.debitWallet(userId, request));
    }

    // ============================================================
    // Freeze & Release Tests
    // ============================================================

    @Test
    void shouldFreezeCreditsSuccessfully() {
        FreezeRequest request = FreezeRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .reason("Test freeze")
                .build();

        when(walletRepository.findById(walletId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(walletAuditRepository.save(any(WalletAudit.class))).thenAnswer(i -> i.getArgument(0));
        when(walletMapper.toTransactionResponse(any(CreditTransaction.class))).thenReturn(transactionResponse);

        TransactionResponse result = walletService.freezeCredits(userId, walletId, request);

        assertNotNull(result);
        verify(walletBalanceRepository, times(1)).save(any(WalletBalance.class));
        verify(walletRepository, times(1)).save(any(Wallet.class));
        verify(creditTransactionRepository, times(1)).save(any(CreditTransaction.class));
    }

    @Test
    void shouldReleaseCreditsSuccessfully() {
        balance.setFrozenBalance(BigDecimal.valueOf(100));
        FreezeRequest request = FreezeRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .reason("Test release")
                .build();

        when(walletRepository.findById(walletId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(walletAuditRepository.save(any(WalletAudit.class))).thenAnswer(i -> i.getArgument(0));
        when(walletMapper.toTransactionResponse(any(CreditTransaction.class))).thenReturn(transactionResponse);

        TransactionResponse result = walletService.releaseCredits(userId, walletId, request);

        assertNotNull(result);
        verify(walletBalanceRepository, times(1)).save(any(WalletBalance.class));
        verify(walletRepository, times(1)).save(any(Wallet.class));
        verify(creditTransactionRepository, times(1)).save(any(CreditTransaction.class));
    }

    // ============================================================
    // History Tests
    // ============================================================

    @Test
    void shouldGetWalletHistory() {
        Page<CreditTransaction> transactionPage = new PageImpl<>(List.of(transaction));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(creditTransactionRepository.findByWalletIdOrderByCreatedAtDesc(any(), any()))
                .thenReturn(transactionPage);
        when(walletMapper.toTransactionResponse(any(CreditTransaction.class))).thenReturn(transactionResponse);

        PageResponse<TransactionResponse> result = walletService.getWalletHistory(userId, 0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertFalse(result.empty());
    }

    // ============================================================
    // Statement Tests
    // ============================================================

    @Test
    void shouldGetWalletStatement() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(creditTransactionRepository.findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                any(), any(), any(), any())).thenReturn(new PageImpl<>(List.of(transaction)));
        when(walletMapper.toTransactionResponse(any(CreditTransaction.class))).thenReturn(transactionResponse);

        PageResponse<TransactionResponse> result = walletService.getWalletStatement(
                userId, LocalDate.now().minusDays(7), LocalDate.now(), 0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
    }

    // ============================================================
    // Audit Log Tests
    // ============================================================

    @Test
    void shouldGetWalletAuditLog() {
        WalletAudit audit = WalletAudit.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .action("WALLET_CREATED")
                .description("Wallet created")
                .build();

        Page<WalletAudit> auditPage = new PageImpl<>(List.of(audit));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletAuditRepository.findByWalletIdOrderByCreatedAtDesc(any(), any()))
                .thenReturn(auditPage);
        when(walletMapper.toAuditResponse(any(WalletAudit.class))).thenReturn(auditResponse);

        PageResponse<WalletAuditResponse> result = walletService.getWalletAuditLog(userId, 0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertEquals("WALLET_CREATED", result.content().getFirst().getAction());
    }

    // ============================================================
    // Statistics Tests
    // ============================================================

    @Test
    void shouldGetWalletStatistics() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletStatisticsRepository.findByWalletId(walletId)).thenReturn(Optional.of(statistics));
        when(walletMapper.toStatisticsResponse(statistics)).thenReturn(statisticsResponse);

        WalletStatisticsResponse result = walletService.getWalletStatistics(userId);

        assertNotNull(result);
        assertEquals(0, result.getTotalTransactions());
    }

    // ============================================================
    // Edge Cases
    // ============================================================

    @Test
    void shouldThrowExceptionWhenDebitingFromSuspendedWallet() {
        wallet.setStatus(WalletStatus.SUSPENDED);
        DebitRequest request = DebitRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .description("Debit")
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        assertThrows(WalletFrozenException.class, () ->
                walletService.debitWallet(userId, request));
    }

    @Test
    void shouldThrowExceptionWhenFreezingNonOwnedWallet() {
        FreezeRequest request = FreezeRequest.builder()
                .amount(BigDecimal.valueOf(50))
                .reason("Freeze")
                .build();

        when(walletRepository.findById(walletId)).thenReturn(Optional.of(wallet));

        assertThrows(BadRequestException.class, () ->
                walletService.freezeCredits(UUID.randomUUID(), walletId, request));
    }

    @Test
    void shouldThrowExceptionWhenFreezingMoreThanAvailable() {
        FreezeRequest request = FreezeRequest.builder()
                .amount(BigDecimal.valueOf(999999))
                .reason("Freeze")
                .build();

        when(walletRepository.findById(walletId)).thenReturn(Optional.of(wallet));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));

        assertThrows(InsufficientBalanceException.class, () ->
                walletService.freezeCredits(userId, walletId, request));
    }
}

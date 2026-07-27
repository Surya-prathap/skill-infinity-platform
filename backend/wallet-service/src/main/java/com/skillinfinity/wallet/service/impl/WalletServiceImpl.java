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
import com.skillinfinity.wallet.enumeration.LedgerEntryType;
import com.skillinfinity.wallet.enumeration.TransactionStatus;
import com.skillinfinity.wallet.enumeration.TransactionType;
import com.skillinfinity.wallet.enumeration.WalletStatus;
import com.skillinfinity.wallet.event.WalletEventPublisher;
import com.skillinfinity.wallet.exception.DuplicateTransactionException;
import com.skillinfinity.wallet.exception.InsufficientBalanceException;
import com.skillinfinity.wallet.exception.WalletFrozenException;
import com.skillinfinity.wallet.exception.WalletNotFoundException;
import com.skillinfinity.wallet.mapper.WalletMapper;
import com.skillinfinity.wallet.repository.CreditTransactionRepository;
import com.skillinfinity.wallet.repository.RewardRepository;
import com.skillinfinity.wallet.repository.WalletAuditRepository;
import com.skillinfinity.wallet.repository.WalletBalanceRepository;
import com.skillinfinity.wallet.repository.WalletLedgerRepository;
import com.skillinfinity.wallet.repository.WalletRepository;
import com.skillinfinity.wallet.repository.WalletStatisticsRepository;
import com.skillinfinity.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private static final String CACHE_BALANCE = "walletBalance";
    private static final String CACHE_DETAILS = "walletDetails";
    private static final String CACHE_STATISTICS = "walletStatistics";
    private static final String CURRENCY_CREDITS = "CREDITS";

    private final WalletRepository walletRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final WalletLedgerRepository walletLedgerRepository;
    private final RewardRepository rewardRepository;
    private final WalletAuditRepository walletAuditRepository;
    private final WalletStatisticsRepository walletStatisticsRepository;
    private final WalletMapper walletMapper;
    private final WalletEventPublisher eventPublisher;

    @Override
    @Transactional
    @CacheEvict(value = CACHE_BALANCE, allEntries = true)
    public WalletResponse createWallet(WalletRequest request) {
        if (walletRepository.existsByUserId(request.getUserId())) {
            throw new BadRequestException("Wallet already exists for userId: " + request.getUserId());
        }

        Wallet wallet = Wallet.builder()
                .userId(request.getUserId())
                .walletNumber(generateWalletNumber())
                .status(WalletStatus.ACTIVE)
                .createdBy(request.getCreatedBy())
                .updatedBy(request.getCreatedBy())
                .build();

        wallet = walletRepository.save(wallet);

        WalletBalance balance = WalletBalance.builder()
                .wallet(wallet)
                .currency(CURRENCY_CREDITS)
                .build();
        walletBalanceRepository.save(balance);

        WalletStatistics statistics = WalletStatistics.builder()
                .wallet(wallet)
                .build();
        walletStatisticsRepository.save(statistics);

        WalletAudit audit = WalletAudit.builder()
                .wallet(wallet)
                .action("WALLET_CREATED")
                .description("Wallet created for user: " + request.getUserId())
                .performedBy(request.getCreatedBy())
                .build();
        walletAuditRepository.save(audit);

        log.info("Wallet created successfully: userId={}, walletId={}", request.getUserId(), wallet.getId());
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWalletByUserId(UUID userId) {
        Wallet wallet = findWalletByUserId(userId);
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_DETAILS, key = "#walletId", unless = "#result == null")
    public WalletResponse getWalletById(UUID walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId.toString()));
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_BALANCE, key = "#userId", unless = "#result == null")
    public WalletBalanceResponse getWalletBalance(UUID userId) {
        Wallet wallet = findWalletByUserId(userId);
        WalletBalance balance = walletBalanceRepository.findByWalletId(wallet.getId())
                .orElseThrow(() -> new WalletNotFoundException("walletId", wallet.getId().toString()));
        return walletMapper.toBalanceResponse(balance);
    }

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_BALANCE, CACHE_DETAILS, CACHE_STATISTICS}, key = "#userId", allEntries = true)
    public TransactionResponse creditWallet(UUID userId, CreditRequest request) {
        Wallet wallet = findWalletByUserId(userId);
        validateWalletActive(wallet);
        validateDuplicateReference(request.getReferenceId());

        WalletBalance balance = findBalanceByWalletId(wallet.getId());
        BigDecimal balanceBefore = balance.getCurrentBalance();
        BigDecimal balanceAfter = balanceBefore.add(request.getAmount());

        CreditTransaction transaction = buildCreditTransaction(wallet, request, TransactionType.CREDIT_PURCHASE, balanceBefore, balanceAfter);
        transaction = creditTransactionRepository.save(transaction);

        updateBalanceAfterCredit(balance, request.getAmount());
        updateWalletTotals(wallet, request.getAmount(), true, false);
        updateStatistics(wallet, request.getAmount(), true);

        walletLedgerRepository.save(buildLedgerEntry(wallet, transaction, LedgerEntryType.CREDIT, request.getAmount(), balanceAfter));

        auditWallet(wallet, "CREDITED", "Wallet credited with " + request.getAmount() + " " + CURRENCY_CREDITS, userId);

        eventPublisher.publishWalletCredited(
                wallet.getId(), userId, transaction.getId(), transaction.getTransactionNumber(),
                request.getAmount(), balanceAfter, request.getDescription(),
                request.getReferenceId(), request.getReferenceType());

        log.info("Wallet credited: userId={}, amount={}, balanceAfter={}", userId, request.getAmount(), balanceAfter);
        return walletMapper.toTransactionResponse(transaction);
    }

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_BALANCE, CACHE_DETAILS, CACHE_STATISTICS}, key = "#userId", allEntries = true)
    public TransactionResponse debitWallet(UUID userId, DebitRequest request) {
        Wallet wallet = findWalletByUserId(userId);
        validateWalletActive(wallet);
        validateSufficientBalance(wallet.getId(), request.getAmount());

        WalletBalance balance = findBalanceByWalletId(wallet.getId());
        BigDecimal balanceBefore = balance.getCurrentBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(request.getAmount());

        CreditTransaction transaction = buildDebitTransaction(wallet, request, balanceBefore, balanceAfter);
        transaction = creditTransactionRepository.save(transaction);

        updateBalanceAfterDebit(balance, request.getAmount());
        updateWalletTotals(wallet, request.getAmount(), false, true);
        updateStatistics(wallet, request.getAmount(), false);

        walletLedgerRepository.save(buildLedgerEntry(wallet, transaction, LedgerEntryType.DEBIT, request.getAmount(), balanceAfter));

        auditWallet(wallet, "DEBITED", "Wallet debited with " + request.getAmount() + " " + CURRENCY_CREDITS, userId);

        eventPublisher.publishWalletDebited(
                wallet.getId(), userId, transaction.getId(), transaction.getTransactionNumber(),
                request.getAmount(), balanceAfter, request.getDescription(),
                request.getReferenceId(), request.getSessionId(), request.getMentorId());

        log.info("Wallet debited: userId={}, amount={}, balanceAfter={}", userId, request.getAmount(), balanceAfter);
        return walletMapper.toTransactionResponse(transaction);
    }

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_BALANCE, CACHE_DETAILS, CACHE_STATISTICS}, allEntries = true)
    public TransactionResponse freezeCredits(UUID userId, UUID walletId, FreezeRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId.toString()));

        if (!wallet.getUserId().equals(userId)) {
            throw new BadRequestException("Wallet does not belong to this user");
        }
        validateWalletActive(wallet);

        WalletBalance balance = findBalanceByWalletId(wallet.getId());
        BigDecimal availableBalance = balance.getAvailableBalance();

        if (availableBalance.compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient available balance. Available: " + availableBalance + ", Requested to freeze: " + request.getAmount());
        }

        balance.setAvailableBalance(balance.getAvailableBalance().subtract(request.getAmount()));
        balance.setFrozenBalance(balance.getFrozenBalance().add(request.getAmount()));
        walletBalanceRepository.save(balance);

        wallet.setFrozenAmount(wallet.getFrozenAmount().add(request.getAmount()));
        walletRepository.save(wallet);

        CreditTransaction transaction = CreditTransaction.builder()
                .wallet(wallet)
                .transactionType(TransactionType.FREEZE)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .balanceBefore(balance.getCurrentBalance())
                .balanceAfter(balance.getCurrentBalance())
                .currency(CURRENCY_CREDITS)
                .description("Frozen: " + request.getReason())
                .referenceId(request.getReferenceId())
                .build();
        transaction = creditTransactionRepository.save(transaction);

        auditWallet(wallet, "FROZEN", "Frozen " + request.getAmount() + " credits: " + request.getReason(), userId);
        log.info("Credits frozen: walletId={}, amount={}", walletId, request.getAmount());
        return walletMapper.toTransactionResponse(transaction);
    }

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_BALANCE, CACHE_DETAILS, CACHE_STATISTICS}, allEntries = true)
    public TransactionResponse releaseCredits(UUID userId, UUID walletId, FreezeRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId.toString()));

        if (!wallet.getUserId().equals(userId)) {
            throw new BadRequestException("Wallet does not belong to this user");
        }

        WalletBalance balance = findBalanceByWalletId(wallet.getId());

        if (balance.getFrozenBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient frozen balance. Frozen: " + balance.getFrozenBalance() + ", Requested to release: " + request.getAmount());
        }

        balance.setFrozenBalance(balance.getFrozenBalance().subtract(request.getAmount()));
        balance.setAvailableBalance(balance.getAvailableBalance().add(request.getAmount()));
        walletBalanceRepository.save(balance);

        wallet.setFrozenAmount(wallet.getFrozenAmount().subtract(request.getAmount()));
        walletRepository.save(wallet);

        CreditTransaction transaction = CreditTransaction.builder()
                .wallet(wallet)
                .transactionType(TransactionType.RELEASE)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .balanceBefore(balance.getCurrentBalance())
                .balanceAfter(balance.getCurrentBalance())
                .currency(CURRENCY_CREDITS)
                .description("Released: " + request.getReason())
                .referenceId(request.getReferenceId())
                .build();
        transaction = creditTransactionRepository.save(transaction);

        auditWallet(wallet, "RELEASED", "Released " + request.getAmount() + " credits: " + request.getReason(), userId);
        log.info("Credits released: walletId={}, amount={}", walletId, request.getAmount());
        return walletMapper.toTransactionResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getWalletHistory(UUID userId, int page, int size) {
        Wallet wallet = findWalletByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CreditTransaction> transactionPage = creditTransactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);

        List<TransactionResponse> content = transactionPage.getContent().stream()
                .map(walletMapper::toTransactionResponse)
                .toList();

        return PageResponse.of(content, page, size, transactionPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getWalletStatement(UUID userId, LocalDate startDate, LocalDate endDate,
                                                                  int page, int size) {
        Wallet wallet = findWalletByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        Page<CreditTransaction> transactionPage = creditTransactionRepository
                .findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                        wallet.getId(), startDateTime, endDateTime, pageable);

        List<TransactionResponse> content = transactionPage.getContent().stream()
                .map(walletMapper::toTransactionResponse)
                .toList();

        return PageResponse.of(content, page, size, transactionPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LedgerEntryResponse> getWalletLedger(UUID userId, int page, int size) {
        Wallet wallet = findWalletByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WalletLedger> ledgerPage = walletLedgerRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);

        List<LedgerEntryResponse> content = ledgerPage.getContent().stream()
                .map(walletMapper::toLedgerEntryResponse)
                .toList();

        return PageResponse.of(content, page, size, ledgerPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RewardResponse> getRewards(UUID userId, int page, int size) {
        Wallet wallet = findWalletByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Reward> rewardPage = rewardRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);

        List<RewardResponse> content = rewardPage.getContent().stream()
                .map(walletMapper::toRewardResponse)
                .toList();

        return PageResponse.of(content, page, size, rewardPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WalletAuditResponse> getWalletAuditLog(UUID userId, int page, int size) {
        Wallet wallet = findWalletByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WalletAudit> auditPage = walletAuditRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);

        List<WalletAuditResponse> content = auditPage.getContent().stream()
                .map(walletMapper::toAuditResponse)
                .toList();

        return PageResponse.of(content, page, size, auditPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_STATISTICS, key = "#userId", unless = "#result == null")
    public WalletStatisticsResponse getWalletStatistics(UUID userId) {
        Wallet wallet = findWalletByUserId(userId);
        WalletStatistics statistics = walletStatisticsRepository.findByWalletId(wallet.getId())
                .orElseThrow(() -> new WalletNotFoundException("walletId", wallet.getId().toString()));
        return walletMapper.toStatisticsResponse(statistics);
    }

    // ============================================================
    // Internal Helper Methods
    // ============================================================

    private Wallet findWalletByUserId(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("userId", userId.toString()));
    }

    private WalletBalance findBalanceByWalletId(UUID walletId) {
        return walletBalanceRepository.findByWalletId(walletId)
                .orElseThrow(() -> new WalletNotFoundException("walletId", walletId.toString()));
    }

    private void validateWalletActive(Wallet wallet) {
        if (WalletStatus.FROZEN.equals(wallet.getStatus())) {
            throw new WalletFrozenException("Wallet is frozen. Cannot perform operations.");
        }
        if (WalletStatus.SUSPENDED.equals(wallet.getStatus())) {
            throw new WalletFrozenException("Wallet is suspended. Cannot perform operations.");
        }
        if (WalletStatus.CLOSED.equals(wallet.getStatus())) {
            throw new WalletNotFoundException(wallet.getId().toString());
        }
    }

    private void validateDuplicateReference(String referenceId) {
        if (referenceId != null && !referenceId.isBlank()
                && creditTransactionRepository.existsByReferenceId(referenceId)) {
            throw new DuplicateTransactionException("Duplicate transaction reference: " + referenceId);
        }
    }

    private void validateSufficientBalance(UUID walletId, BigDecimal amount) {
        WalletBalance balance = findBalanceByWalletId(walletId);
        if (balance.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Available: " + balance.getAvailableBalance()
                            + ", Requested: " + amount);
        }
    }

    private CreditTransaction buildCreditTransaction(Wallet wallet, CreditRequest request,
                                                      TransactionType type, BigDecimal balanceBefore, BigDecimal balanceAfter) {
        return CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
                .transactionType(type)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .currency(CURRENCY_CREDITS)
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .sessionId(request.getSessionId())
                .mentorId(request.getMentorId())
                .paymentGatewayRef(request.getPaymentGatewayRef())
                .build();
    }

    private CreditTransaction buildDebitTransaction(Wallet wallet, DebitRequest request,
                                                     BigDecimal balanceBefore, BigDecimal balanceAfter) {
        return CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
                .transactionType(TransactionType.CREDIT_CONSUMPTION)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .currency(CURRENCY_CREDITS)
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .sessionId(request.getSessionId())
                .mentorId(request.getMentorId())
                .build();
    }

    private void updateBalanceAfterCredit(WalletBalance balance, BigDecimal amount) {
        balance.setCurrentBalance(balance.getCurrentBalance().add(amount));
        balance.setAvailableBalance(balance.getAvailableBalance().add(amount));
        walletBalanceRepository.save(balance);
    }

    private void updateBalanceAfterDebit(WalletBalance balance, BigDecimal amount) {
        balance.setCurrentBalance(balance.getCurrentBalance().subtract(amount));
        balance.setAvailableBalance(balance.getAvailableBalance().subtract(amount));
        walletBalanceRepository.save(balance);
    }

    private void updateWalletTotals(Wallet wallet, BigDecimal amount, boolean isCredit, boolean isSpent) {
        if (isCredit) {
            wallet.setTotalCreditsPurchased(wallet.getTotalCreditsPurchased().add(amount));
            wallet.setLastTransactionAt(LocalDateTime.now());
        }
        if (isSpent) {
            wallet.setTotalCreditsSpent(wallet.getTotalCreditsSpent().add(amount));
            wallet.setLastTransactionAt(LocalDateTime.now());
        }
        walletRepository.save(wallet);
    }

    private void updateStatistics(Wallet wallet, BigDecimal amount, boolean isCredit) {
        WalletStatistics stats = walletStatisticsRepository.findByWalletId(wallet.getId())
                .orElse(null);
        if (stats == null) return;

        stats.setTotalTransactions(stats.getTotalTransactions() + 1);
        stats.setSuccessfulTransactions(stats.getSuccessfulTransactions() + 1);
        stats.setLastActivityDate(LocalDateTime.now());

        if (isCredit) {
            stats.setTotalCreditsIn(stats.getTotalCreditsIn().add(amount));
            if (amount.compareTo(stats.getLargestCredit()) > 0) {
                stats.setLargestCredit(amount);
            }
        } else {
            stats.setTotalCreditsOut(stats.getTotalCreditsOut().add(amount));
            if (amount.compareTo(stats.getLargestDebit()) > 0) {
                stats.setLargestDebit(amount);
            }
        }

        long totalTx = stats.getSuccessfulTransactions();
        if (totalTx > 0) {
            BigDecimal totalIn = stats.getTotalCreditsIn();
            BigDecimal totalOut = stats.getTotalCreditsOut();
            BigDecimal totalFlow = totalIn.add(totalOut);
            stats.setAverageTransactionAmount(totalFlow.divide(BigDecimal.valueOf(totalTx), 2, RoundingMode.HALF_UP));
        }

        walletStatisticsRepository.save(stats);
    }

    private WalletLedger buildLedgerEntry(Wallet wallet, CreditTransaction transaction,
                                           LedgerEntryType entryType, BigDecimal amount, BigDecimal balanceAfter) {
        return WalletLedger.builder()
                .wallet(wallet)
                .entryNumber(generateEntryNumber())
                .entryType(entryType)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .description(transaction.getDescription())
                .referenceId(transaction.getReferenceId())
                .transactionId(transaction.getId())
                .build();
    }

    private void auditWallet(Wallet wallet, String action, String description, UUID performedBy) {
        WalletAudit audit = WalletAudit.builder()
                .wallet(wallet)
                .action(action)
                .description(description)
                .performedBy(performedBy != null ? performedBy.toString() : null)
                .build();
        walletAuditRepository.save(audit);
    }

    private String generateWalletNumber() {
        return "WAL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%06d", ThreadLocalRandom.current().nextInt(999999));
    }

    private String generateTransactionNumber() {
        return "TXN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(9999));
    }

    private String generateEntryNumber() {
        return "LED-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(9999));
    }
}

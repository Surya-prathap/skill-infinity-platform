package com.skillinfinity.wallet.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.wallet.dto.request.CreditRequest;
import com.skillinfinity.wallet.dto.request.DebitRequest;
import com.skillinfinity.wallet.dto.request.FreezeRequest;
import com.skillinfinity.wallet.dto.request.WalletRequest;
import com.skillinfinity.wallet.dto.request.WithdrawalRequestDto;
import com.skillinfinity.wallet.dto.response.TransactionResponse;
import com.skillinfinity.wallet.dto.response.WalletBalanceResponse;
import com.skillinfinity.wallet.dto.response.WalletResponse;
import com.skillinfinity.wallet.dto.response.WalletAuditResponse;
import com.skillinfinity.wallet.dto.response.WalletStatisticsResponse;
import com.skillinfinity.wallet.dto.response.WithdrawalResponse;
import com.skillinfinity.wallet.entity.CreditTransaction;
import com.skillinfinity.wallet.entity.Wallet;
import com.skillinfinity.wallet.entity.WalletAudit;
import com.skillinfinity.wallet.entity.WalletBalance;
import com.skillinfinity.wallet.entity.WalletLedger;
import com.skillinfinity.wallet.entity.WalletStatistics;
import com.skillinfinity.wallet.entity.WithdrawalRequest;
import com.skillinfinity.wallet.enumeration.CreditType;
import com.skillinfinity.wallet.enumeration.LedgerEntryType;
import com.skillinfinity.wallet.enumeration.TransactionStatus;
import com.skillinfinity.wallet.enumeration.TransactionType;
import com.skillinfinity.wallet.enumeration.WalletStatus;
import com.skillinfinity.wallet.enumeration.WithdrawalStatus;
import com.skillinfinity.wallet.event.WalletEventPublisher;
import com.skillinfinity.wallet.exception.DuplicateTransactionException;
import com.skillinfinity.wallet.exception.InsufficientBalanceException;
import com.skillinfinity.wallet.exception.WalletFrozenException;
import com.skillinfinity.wallet.exception.WalletNotFoundException;
import com.skillinfinity.wallet.mapper.WalletMapper;
import com.skillinfinity.wallet.repository.CreditTransactionRepository;
import com.skillinfinity.wallet.repository.WalletAuditRepository;
import com.skillinfinity.wallet.repository.WalletBalanceRepository;
import com.skillinfinity.wallet.repository.WalletLedgerRepository;
import com.skillinfinity.wallet.repository.WalletRepository;
import com.skillinfinity.wallet.repository.WalletStatisticsRepository;
import com.skillinfinity.wallet.repository.WithdrawalRequestRepository;
import com.skillinfinity.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private static final String CURRENCY_CREDITS = "CREDITS";

    /** One-time promotional grant every new learner receives. */
    private static final BigDecimal WELCOME_CREDITS_AMOUNT = BigDecimal.valueOf(3);
    private static final String WELCOME_CREDITS_REFERENCE_TYPE = "WELCOME_CREDITS";

    /**
     * Business rules (admin-configurable via env/application.yml):
     * 1 withdrawable credit = ₹10; 10% platform commission on withdrawals;
     * minimum withdrawal 10 credits. Mentor earnings follow the credit origin
     * (welcome/learning → learning credits, purchased → withdrawable).
     */
    @Value("${app.withdrawal.credit-value-inr:10}")
    private BigDecimal creditValueInr = BigDecimal.TEN;

    @Value("${app.withdrawal.platform-fee-percent:10.0}")
    private BigDecimal platformFeePercent = BigDecimal.valueOf(10);

    @Value("${app.withdrawal.min-credits:10}")
    private BigDecimal minWithdrawalCredits = BigDecimal.TEN;


    private final WalletRepository walletRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final WalletLedgerRepository walletLedgerRepository;
    private final WalletAuditRepository walletAuditRepository;
    private final WalletStatisticsRepository walletStatisticsRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final WalletMapper walletMapper;
    private final WalletEventPublisher eventPublisher;

    @Override
    @Transactional
    public WalletResponse createWallet(WalletRequest request) {
        if (walletRepository.existsByUserId(request.getUserId())) {
            throw new BadRequestException("Wallet already exists for userId: " + request.getUserId());
        }

        Wallet wallet = createWalletInternal(request.getUserId(), request.getCreatedBy());
        grantWelcomeCredits(wallet, request.getUserId());

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
    public WalletResponse getWalletById(UUID walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId.toString()));
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletBalanceResponse getWalletBalance(UUID userId) {
        Wallet wallet = getOrCreateWallet(userId);
        WalletBalance balance = walletBalanceRepository.findByWalletId(wallet.getId())
                .orElseThrow(() -> new WalletNotFoundException("walletId", wallet.getId().toString()));
        return walletMapper.toBalanceResponse(balance);
    }

    @Override
    @Transactional
    public TransactionResponse creditWallet(UUID userId, CreditRequest request) {
        Wallet wallet = getOrCreateWallet(userId);
        validateWalletActive(wallet);
        validateDuplicateReference(request.getReferenceId());

        WalletBalance balance = findBalanceByWalletId(wallet.getId());
        BigDecimal balanceBefore = balance.getCurrentBalance();
        BigDecimal balanceAfter = balanceBefore.add(request.getAmount());

        CreditType creditType = resolveCreditType(request.getCreditType());
        TransactionType transactionType = CreditType.WELCOME.equals(creditType)
                ? TransactionType.PROMOTIONAL_CREDIT
                : TransactionType.CREDIT_PURCHASE;
        CreditTransaction transaction = buildCreditTransaction(wallet, request, transactionType, balanceBefore, balanceAfter);
        transaction = creditTransactionRepository.save(transaction);

        updateBalanceAfterCredit(balance, request.getAmount(), creditType);
        if (creditType == CreditType.PURCHASED || creditType == CreditType.WELCOME) {
            updateWalletTotals(wallet, request.getAmount(), true, false);
        }
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
    public TransactionResponse debitWallet(UUID userId, DebitRequest request) {
        Wallet wallet = getOrCreateWallet(userId);
        validateWalletActive(wallet);
        validateSufficientBalance(wallet.getId(), request.getAmount());

        WalletBalance balance = findBalanceByWalletId(wallet.getId());
        BigDecimal balanceBefore = balance.getCurrentBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(request.getAmount());

        CreditTransaction transaction = buildDebitTransaction(wallet, request, balanceBefore, balanceAfter);
        transaction = creditTransactionRepository.save(transaction);

        applyPriorityDebit(balance, request.getAmount(), false);
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

        // Legacy rows can carry NULL frozen_amount (column added later / raw inserts).
        wallet.setFrozenAmount(Optional.ofNullable(wallet.getFrozenAmount()).orElse(BigDecimal.ZERO).add(request.getAmount()));
        walletRepository.save(wallet);

        CreditTransaction transaction = CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
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
    public TransactionResponse releaseCredits(UUID userId, UUID walletId, FreezeRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId.toString()));

        if (!wallet.getUserId().equals(userId)) {
            throw new BadRequestException("Wallet does not belong to this user");
        }

        // Idempotency: a release may be retried after a network timeout where
        // the wallet actually committed (or the session auto-complete job re-
        // processes a session). Releasing the same reference twice would fail
        // on the frozen-balance check below and leave the caller unable to
        // complete its own state transition. If this reference was already
        // released, treat the retry as a no-op success.
        // NOTE: the same reference may appear on BOTH a FREEZE and a RELEASE
        // transaction, so the lookup must filter by type — findByReferenceId
        // alone throws when two rows share the reference.
        String referenceId = request.getReferenceId();
        if (referenceId != null && !referenceId.isBlank()) {
            List<CreditTransaction> existingReleases = creditTransactionRepository
                    .findByReferenceIdAndTransactionType(referenceId, TransactionType.RELEASE);
            if (!existingReleases.isEmpty()) {
                log.info("Release already recorded for reference {} — idempotent skip", referenceId);
                return walletMapper.toTransactionResponse(existingReleases.get(0));
            }
        }

        WalletBalance balance = findBalanceByWalletId(wallet.getId());

        if (balance.getFrozenBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient frozen balance. Frozen: " + balance.getFrozenBalance() + ", Requested to release: " + request.getAmount());
        }

        balance.setFrozenBalance(balance.getFrozenBalance().subtract(request.getAmount()));
        balance.setAvailableBalance(balance.getAvailableBalance().add(request.getAmount()));
        walletBalanceRepository.save(balance);

        BigDecimal frozen = Optional.ofNullable(wallet.getFrozenAmount()).orElse(BigDecimal.ZERO);
        wallet.setFrozenAmount(frozen.subtract(request.getAmount()));
        walletRepository.save(wallet);

        CreditTransaction transaction = CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
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
    @Transactional
    public TransactionResponse freezeByUser(UUID userId, FreezeRequest request) {
        Wallet wallet = getOrCreateWallet(userId);
        validateWalletActive(wallet);
        return freezeCredits(userId, wallet.getId(), request);
    }

    @Override
    @Transactional
    public TransactionResponse releaseByUser(UUID userId, FreezeRequest request) {
        Wallet wallet = getOrCreateWallet(userId);
        return releaseCredits(userId, wallet.getId(), request);
    }

    @Override
    @Transactional
    public void settleSessionCredits(UUID sessionId, UUID learnerId, UUID mentorId, BigDecimal credits,
                                     boolean community) {
        if (credits == null || credits.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("No credit settlement for session {} (free/community)", sessionId);
            return;
        }

        // Per-(session, learner) reference so a paid community session with
        // several learners settles each learner's hold independently, while a
        // redelivered RabbitMQ message never settles the same learner twice.
        String reference = "SESSION-" + sessionId + "-" + learnerId;

        // Idempotency guard — a redelivered RabbitMQ message must not settle twice.
        if (creditTransactionRepository.existsByReferenceId(reference)) {
            log.info("Session {} learner {} already settled — skipping duplicate settlement",
                    sessionId, learnerId);
            return;
        }

        // ---- Learner: convert the booking hold into a real debit ----
        Wallet learnerWallet = getOrCreateWallet(learnerId);
        WalletBalance learnerBalance = findBalanceByWalletId(learnerWallet.getId());
        boolean fromFrozen = learnerBalance.getFrozenBalance().compareTo(credits) >= 0;
        BigDecimal before = learnerBalance.getCurrentBalance();

        CreditConsumption consumption = applyPriorityDebit(learnerBalance, credits, fromFrozen);

        CreditTransaction debit = CreditTransaction.builder()
                .wallet(learnerWallet)
                .transactionNumber(generateTransactionNumber())
                .transactionType(TransactionType.CREDIT_CONSUMPTION)
                .status(TransactionStatus.COMPLETED)
                .amount(credits)
                .balanceBefore(before)
                .balanceAfter(learnerBalance.getCurrentBalance())
                .currency(CURRENCY_CREDITS)
                .description("Session completed — credits consumed (session " + sessionId
                        + ", source: " + describeConsumption(consumption) + ")")
                .referenceId(reference)
                .referenceType("SESSION_CONSUMPTION")
                .sessionId(sessionId)
                .mentorId(mentorId)
                .metadataJson("{\"welcome\":" + consumption.welcome().toPlainString()
                        + ",\"purchased\":" + consumption.purchased().toPlainString()
                        + ",\"learning\":" + consumption.learning().toPlainString() + "}")
                .build();
        creditTransactionRepository.save(debit);
        updateWalletTotals(learnerWallet, credits, false, true);
        updateStatistics(learnerWallet, credits, false);
        walletLedgerRepository.save(buildLedgerEntry(learnerWallet, debit, LedgerEntryType.DEBIT,
                credits, learnerBalance.getCurrentBalance()));
        auditWallet(learnerWallet, "SESSION_SETTLED",
                "Session " + sessionId + " completed — " + credits + " credits consumed", learnerId);

        // ---- Mentor: source-based allocation (same rule for professional
        // and community sessions) ----
        //
        // The origin of the credits is preserved throughout the transaction:
        //   WELCOME credits     → LEARNING/EARNED credits for the mentor
        //   LEARNING credits    → LEARNING/EARNED credits for the mentor
        //   PURCHASED credits   → WITHDRAWABLE credits for the mentor
        // Welcome/earned credits are never converted into withdrawable money.
        BigDecimal learningShare = consumption.welcome().add(consumption.learning());
        BigDecimal withdrawableShare = consumption.purchased();
        creditMentorEarnings(mentorId, sessionId, learnerId, learningShare, withdrawableShare, reference);

        log.info("Session {} settled (community={}): learner {} debited {} credits "
                        + "({}), mentor {} earned ({} learning, {} withdrawable)",
                sessionId, community, learnerId, credits, describeConsumption(consumption), mentorId,
                learningShare.stripTrailingZeros().toPlainString(),
                withdrawableShare.stripTrailingZeros().toPlainString());
    }

    private String describeConsumption(CreditConsumption consumption) {
        StringBuilder sb = new StringBuilder();
        if (consumption.welcome().signum() > 0) {
            sb.append(consumption.welcome().stripTrailingZeros().toPlainString()).append(" welcome");
        }
        if (consumption.purchased().signum() > 0) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(consumption.purchased().stripTrailingZeros().toPlainString()).append(" purchased");
        }
        if (consumption.learning().signum() > 0) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(consumption.learning().stripTrailingZeros().toPlainString()).append(" learning");
        }
        return sb.isEmpty() ? "none" : sb.toString();
    }

    /** Credits a mentor's learning and withdrawable buckets after a completed session. */
    private void creditMentorEarnings(UUID mentorId, UUID sessionId, UUID learnerId,
                                      BigDecimal learningShare, BigDecimal withdrawableShare,
                                      String referenceId) {
        Wallet wallet = getOrCreateWallet(mentorId);
        validateWalletActive(wallet);
        WalletBalance balance = findBalanceByWalletId(wallet.getId());

        if (learningShare.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal before = balance.getCurrentBalance();
            balance.setLearningBalance(balance.getLearningBalance().add(learningShare));
            balance.setCurrentBalance(balance.getCurrentBalance().add(learningShare));
            balance.setAvailableBalance(balance.getAvailableBalance().add(learningShare));
            walletBalanceRepository.save(balance);
            recordEarningTransaction(wallet, sessionId, learnerId, learningShare, before,
                    "Learning credits earned from session " + sessionId, "LEARNING", referenceId);
        }

        if (withdrawableShare.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal before = balance.getCurrentBalance();
            balance.setWithdrawableBalance(balance.getWithdrawableBalance().add(withdrawableShare));
            balance.setCurrentBalance(balance.getCurrentBalance().add(withdrawableShare));
            balance.setAvailableBalance(balance.getAvailableBalance().add(withdrawableShare));
            walletBalanceRepository.save(balance);
            recordEarningTransaction(wallet, sessionId, learnerId, withdrawableShare, before,
                    "Withdrawable credits earned from session " + sessionId, "WITHDRAWABLE", referenceId);
        }

        wallet.setTotalCreditsEarned(wallet.getTotalCreditsEarned()
                .add(learningShare).add(withdrawableShare));
        wallet.setLastTransactionAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    private void recordEarningTransaction(Wallet wallet, UUID sessionId, UUID learnerId,
                                          BigDecimal amount, BigDecimal balanceBefore, String description,
                                          String referenceType, String referenceId) {
        BigDecimal balanceAfter = balanceBefore.add(amount);
        CreditTransaction tx = CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
                .transactionType(TransactionType.SESSION_PAYMENT)
                .status(TransactionStatus.COMPLETED)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .currency(CURRENCY_CREDITS)
                .description(description)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .sessionId(sessionId)
                .mentorId(learnerId)
                .build();
        creditTransactionRepository.save(tx);
        updateStatistics(wallet, amount, true);
        walletLedgerRepository.save(buildLedgerEntry(wallet, tx, LedgerEntryType.CREDIT, amount, balanceAfter));
        auditWallet(wallet, "SESSION_EARNING", description, wallet.getUserId());
        eventPublisher.publishWalletCredited(
                wallet.getId(), wallet.getUserId(), tx.getId(), tx.getTransactionNumber(),
                amount, balanceAfter, description, referenceId, referenceType);
    }

    // ============================================================
    // Withdrawals
    // ============================================================

    @Override
    @Transactional
    public WithdrawalResponse requestWithdrawal(UUID userId, WithdrawalRequestDto request) {
        Wallet wallet = getOrCreateWallet(userId);
        validateWalletActive(wallet);
        WalletBalance balance = findBalanceByWalletId(wallet.getId());

        if (request.getAmountCredits().compareTo(balance.getWithdrawableBalance()) > 0) {
            throw new BadRequestException("Insufficient withdrawable credits. Available: "
                    + balance.getWithdrawableBalance());
        }
        if (request.getAmountCredits().compareTo(minWithdrawalCredits) < 0) {
            throw new BadRequestException("Minimum withdrawal is " + minWithdrawalCredits
                    + " withdrawable credits (1 credit = ₹" + creditValueInr + ").");
        }

        BigDecimal gross = request.getAmountCredits().multiply(creditValueInr);
        BigDecimal fee = gross.multiply(platformFeePercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee);

        // Hold the payout: withdrawable credits move to frozen until reviewed.
        balance.setWithdrawableBalance(balance.getWithdrawableBalance().subtract(request.getAmountCredits()));
        balance.setFrozenBalance(balance.getFrozenBalance().add(request.getAmountCredits()));
        walletBalanceRepository.save(balance);

        WithdrawalRequest withdrawal = WithdrawalRequest.builder()
                .userId(userId)
                .amountCredits(request.getAmountCredits())
                .grossAmountInr(gross)
                .platformFeeInr(fee)
                .netAmountInr(net)
                .status(WithdrawalStatus.PENDING)
                .bankDetails(request.getBankDetails())
                .build();
        withdrawal = withdrawalRequestRepository.save(withdrawal);

        CreditTransaction tx = CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
                .transactionType(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmountCredits())
                .balanceBefore(balance.getCurrentBalance())
                .balanceAfter(balance.getCurrentBalance())
                .currency(CURRENCY_CREDITS)
                .description("Withdrawal requested — " + request.getAmountCredits() + " credits → ₹" + net
                        + " (gross ₹" + gross + ", fee ₹" + fee + ")")
                .referenceId(withdrawal.getId().toString())
                .referenceType("WITHDRAWAL")
                .build();
        creditTransactionRepository.save(tx);
        auditWallet(wallet, "WITHDRAWAL_REQUESTED",
                "Withdrawal requested: " + request.getAmountCredits() + " credits (net ₹" + net + ")", userId);

        log.info("Withdrawal requested: userId={}, credits={}, netInr={}", userId, request.getAmountCredits(), net);
        return toWithdrawalResponse(withdrawal);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WithdrawalResponse> getMyWithdrawals(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WithdrawalRequest> requests = withdrawalRequestRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.of(requests.getContent().stream().map(this::toWithdrawalResponse).toList(),
                page, size, requests.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WithdrawalResponse> getAllWithdrawals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WithdrawalRequest> requests = withdrawalRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.of(requests.getContent().stream().map(this::toWithdrawalResponse).toList(),
                page, size, requests.getTotalElements());
    }

    @Override
    @Transactional
    public WithdrawalResponse approveWithdrawal(UUID withdrawalId, UUID adminId) {
        WithdrawalRequest withdrawal = findWithdrawal(withdrawalId);
        if (!WithdrawalStatus.PENDING.equals(withdrawal.getStatus())) {
            throw new BadRequestException("Withdrawal is not pending: " + withdrawal.getStatus());
        }
        Wallet wallet = getOrCreateWallet(withdrawal.getUserId());
        WalletBalance balance = findBalanceByWalletId(wallet.getId());

        // The payout is already held in frozenBalance — finalize it.
        balance.setFrozenBalance(balance.getFrozenBalance()
                .subtract(withdrawal.getAmountCredits()));
        walletBalanceRepository.save(balance);

        withdrawal.setStatus(WithdrawalStatus.APPROVED);
        withdrawal.setReviewedBy(adminId);
        withdrawal.setReviewedAt(LocalDateTime.now());
        withdrawal.setTransactionRef("WD-" + withdrawal.getId().toString().substring(0, 8).toUpperCase());
        withdrawal = withdrawalRequestRepository.save(withdrawal);

        auditWallet(wallet, "WITHDRAWAL_APPROVED",
                "Withdrawal approved: " + withdrawal.getAmountCredits() + " credits (net ₹"
                        + withdrawal.getNetAmountInr() + ")", adminId);
        log.info("Withdrawal approved: id={}, adminId={}", withdrawalId, adminId);
        return toWithdrawalResponse(withdrawal);
    }

    @Override
    @Transactional
    public WithdrawalResponse rejectWithdrawal(UUID withdrawalId, UUID adminId, String reason) {
        WithdrawalRequest withdrawal = findWithdrawal(withdrawalId);
        if (!WithdrawalStatus.PENDING.equals(withdrawal.getStatus())) {
            throw new BadRequestException("Withdrawal is not pending: " + withdrawal.getStatus());
        }
        Wallet wallet = getOrCreateWallet(withdrawal.getUserId());
        WalletBalance balance = findBalanceByWalletId(wallet.getId());

        // Return the held credits to the withdrawable bucket.
        balance.setFrozenBalance(balance.getFrozenBalance()
                .subtract(withdrawal.getAmountCredits()));
        balance.setWithdrawableBalance(balance.getWithdrawableBalance()
                .add(withdrawal.getAmountCredits()));
        walletBalanceRepository.save(balance);

        withdrawal.setStatus(WithdrawalStatus.REJECTED);
        withdrawal.setRejectionReason(reason);
        withdrawal.setReviewedBy(adminId);
        withdrawal.setReviewedAt(LocalDateTime.now());
        withdrawal = withdrawalRequestRepository.save(withdrawal);

        auditWallet(wallet, "WITHDRAWAL_REJECTED",
                "Withdrawal rejected: " + withdrawal.getAmountCredits() + " credits returned", adminId);
        log.info("Withdrawal rejected: id={}, reason={}", withdrawalId, reason);
        return toWithdrawalResponse(withdrawal);
    }

    private WithdrawalRequest findWithdrawal(UUID withdrawalId) {
        return withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new WalletNotFoundException("withdrawalId", withdrawalId.toString()));
    }

    private WithdrawalResponse toWithdrawalResponse(WithdrawalRequest w) {
        return WithdrawalResponse.builder()
                .id(w.getId())
                .userId(w.getUserId())
                .amountCredits(w.getAmountCredits())
                .grossAmountInr(w.getGrossAmountInr())
                .platformFeeInr(w.getPlatformFeeInr())
                .netAmountInr(w.getNetAmountInr())
                .status(w.getStatus().name())
                .bankDetails(w.getBankDetails())
                .rejectionReason(w.getRejectionReason())
                .transactionRef(w.getTransactionRef())
                .reviewedBy(w.getReviewedBy())
                .reviewedAt(w.getReviewedAt())
                .createdAt(w.getCreatedAt())
                .build();
    }

    @Override
    // Not read-only: a first-time user has no wallet yet, and getOrCreateWallet
    // creates one (with the one-time welcome grant) inside this method.
    @Transactional
    public PageResponse<TransactionResponse> getWalletHistory(UUID userId, int page, int size) {
        Wallet wallet = getOrCreateWallet(userId);
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
    // Not read-only: getOrCreateWallet creates the wallet on first access.
    @Transactional
    public WalletStatisticsResponse getWalletStatistics(UUID userId) {
        Wallet wallet = getOrCreateWallet(userId);
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

    /**
     * Returns the user's wallet, creating it on first use (e.g. a new
     * registration, or a credit-purchase payment event arriving before any
     * explicit wallet creation). Welcome credits are granted exactly once,
     * at wallet creation, and are never replenished.
     */
    private Wallet getOrCreateWallet(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet created = createWalletInternal(userId, userId.toString());
                    grantWelcomeCredits(created, userId);
                    log.info("Wallet auto-created with welcome credits: userId={}, walletId={}", userId, created.getId());
                    return created;
                });
    }

    private Wallet createWalletInternal(UUID userId, String createdBy) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletNumber(generateWalletNumber())
                .status(WalletStatus.ACTIVE)
                .createdBy(createdBy)
                .updatedBy(createdBy)
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
                .description("Wallet created for user: " + userId)
                .performedBy(createdBy)
                .build();
        walletAuditRepository.save(audit);

        return wallet;
    }

    /**
     * Grants the one-time 3-credit welcome bonus and records it as a
     * separate promotional transaction so it can be tracked independently
     * from purchased credits.
     */
    private void grantWelcomeCredits(Wallet wallet, UUID userId) {
        WalletBalance balance = findBalanceByWalletId(wallet.getId());
        BigDecimal balanceBefore = balance.getCurrentBalance();
        BigDecimal balanceAfter = balanceBefore.add(WELCOME_CREDITS_AMOUNT);

        CreditTransaction transaction = CreditTransaction.builder()
                .wallet(wallet)
                .transactionNumber(generateTransactionNumber())
                .transactionType(TransactionType.PROMOTIONAL_CREDIT)
                .status(TransactionStatus.COMPLETED)
                .amount(WELCOME_CREDITS_AMOUNT)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .currency(CURRENCY_CREDITS)
                .description("Welcome credits — 1 credit = 10 minutes of learning")
                .referenceType(WELCOME_CREDITS_REFERENCE_TYPE)
                .build();
        transaction = creditTransactionRepository.save(transaction);

        updateBalanceAfterCredit(balance, WELCOME_CREDITS_AMOUNT, CreditType.WELCOME);
        wallet.setTotalBonus(wallet.getTotalBonus().add(WELCOME_CREDITS_AMOUNT));
        wallet.setLastTransactionAt(LocalDateTime.now());
        walletRepository.save(wallet);
        updateStatistics(wallet, WELCOME_CREDITS_AMOUNT, true);

        walletLedgerRepository.save(buildLedgerEntry(wallet, transaction, LedgerEntryType.CREDIT,
                WELCOME_CREDITS_AMOUNT, balanceAfter));

        auditWallet(wallet, "WELCOME_CREDITS", "Granted " + WELCOME_CREDITS_AMOUNT + " welcome credits", userId);

        eventPublisher.publishWalletCredited(
                wallet.getId(), userId, transaction.getId(), transaction.getTransactionNumber(),
                WELCOME_CREDITS_AMOUNT, balanceAfter, "Welcome credits",
                null, WELCOME_CREDITS_REFERENCE_TYPE);
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

    private void updateBalanceAfterCredit(WalletBalance balance, BigDecimal amount, CreditType creditType) {
        switch (creditType) {
            case WELCOME -> balance.setWelcomeBalance(balance.getWelcomeBalance().add(amount));
            case LEARNING -> balance.setLearningBalance(balance.getLearningBalance().add(amount));
            case WITHDRAWABLE -> balance.setWithdrawableBalance(balance.getWithdrawableBalance().add(amount));
            default -> balance.setPurchasedBalance(balance.getPurchasedBalance().add(amount));
        }
        balance.setCurrentBalance(balance.getCurrentBalance().add(amount));
        balance.setAvailableBalance(balance.getAvailableBalance().add(amount));
        walletBalanceRepository.save(balance);
    }

    private CreditType resolveCreditType(String creditType) {
        if (creditType == null || creditType.isBlank()) {
            return CreditType.PURCHASED;
        }
        try {
            return CreditType.valueOf(creditType.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown creditType '{}' — defaulting to PURCHASED", creditType);
            return CreditType.PURCHASED;
        }
    }

    /** How a debit was sourced across the learning-usable buckets. */
    public record CreditConsumption(BigDecimal welcome, BigDecimal purchased, BigDecimal learning) {
    }

    /**
     * Deducts from the learning-usable buckets in spec priority order
     * WELCOME → PURCHASED → LEARNING. When {@code consumedFromFrozen} is true
     * the amount was previously frozen (session booking hold) so only the
     * frozen balance and current balance decrease — the available balance has
     * already excluded it.
     *
     * @return the per-bucket consumption so the ledger can identify the
     *         credit type that funded the debit
     */
    private CreditConsumption applyPriorityDebit(WalletBalance balance, BigDecimal amount, boolean consumedFromFrozen) {
        // Lazy migration: wallets created before the bucket columns existed have
        // zero bucket balances but a non-zero currentBalance. Treat the whole
        // legacy balance as purchased credits so old wallets stay spendable.
        BigDecimal bucketSum = balance.getWelcomeBalance()
                .add(balance.getPurchasedBalance())
                .add(balance.getLearningBalance());
        if (bucketSum.compareTo(BigDecimal.ZERO) == 0
                && balance.getCurrentBalance().compareTo(BigDecimal.ZERO) > 0) {
            balance.setPurchasedBalance(balance.getCurrentBalance());
        }

        BigDecimal remaining = amount;

        BigDecimal welcomeTake = min(balance.getWelcomeBalance(), remaining);
        remaining = remaining.subtract(welcomeTake);

        BigDecimal purchasedTake = min(balance.getPurchasedBalance(), remaining);
        remaining = remaining.subtract(purchasedTake);

        BigDecimal learningTake = min(balance.getLearningBalance(), remaining);
        remaining = remaining.subtract(learningTake);

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new InsufficientBalanceException(
                    "Insufficient credits. Available: " + balance.getCurrentBalance()
                            + ", Requested: " + amount);
        }

        balance.setWelcomeBalance(balance.getWelcomeBalance().subtract(welcomeTake));
        balance.setPurchasedBalance(balance.getPurchasedBalance().subtract(purchasedTake));
        balance.setLearningBalance(balance.getLearningBalance().subtract(learningTake));
        balance.setCurrentBalance(balance.getCurrentBalance().subtract(amount));
        balance.setAvailableBalance(balance.getAvailableBalance()
                .subtract(consumedFromFrozen ? BigDecimal.ZERO : amount));
        if (consumedFromFrozen) {
            balance.setFrozenBalance(balance.getFrozenBalance().subtract(amount));
        }
        walletBalanceRepository.save(balance);
        return new CreditConsumption(welcomeTake, purchasedTake, learningTake);
    }

    private BigDecimal min(BigDecimal a, BigDecimal b) {
        return a.compareTo(b) <= 0 ? a : b;
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

    /**
     * Transaction numbers must fit the 20-char DB column (see
     * CreditTransaction#transactionNumber). "TXN-yyyyMMdd-######" is 19 chars.
     */
    private String generateTransactionNumber() {
        return "TXN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%06d", ThreadLocalRandom.current().nextInt(999999));
    }

    /**
     * Ledger entry numbers must fit the 20-char DB column (see
     * WalletLedger#entryNumber). "LED-yyyyMMdd-######" is 19 chars.
     */
    private String generateEntryNumber() {
        return "LED-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%06d", ThreadLocalRandom.current().nextInt(999999));
    }
}

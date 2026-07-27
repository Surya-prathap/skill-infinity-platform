package com.skillinfinity.wallet.mapper;

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
import com.skillinfinity.wallet.enumeration.RewardType;
import com.skillinfinity.wallet.enumeration.TransactionStatus;
import com.skillinfinity.wallet.enumeration.TransactionType;
import com.skillinfinity.wallet.enumeration.WalletStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class WalletMapperTest {

    private WalletMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(WalletMapper.class);
    }

    @Test
    void shouldMapWalletToResponse() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Wallet wallet = Wallet.builder()
                .id(id)
                .userId(userId)
                .walletNumber("WAL-20240101-000001")
                .status(WalletStatus.ACTIVE)
                .totalCreditsPurchased(BigDecimal.valueOf(1000))
                .totalCreditsSpent(BigDecimal.valueOf(500))
                .totalCreditsEarned(BigDecimal.valueOf(200))
                .totalRewards(BigDecimal.valueOf(100))
                .totalBonus(BigDecimal.valueOf(50))
                .totalRefunds(BigDecimal.valueOf(25))
                .frozenAmount(BigDecimal.valueOf(100))
                .build();

        WalletResponse response = mapper.toWalletResponse(wallet);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(userId, response.getUserId());
        assertEquals("WAL-20240101-000001", response.getWalletNumber());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals(BigDecimal.valueOf(1000), response.getTotalCreditsPurchased());
        assertEquals(BigDecimal.valueOf(500), response.getTotalCreditsSpent());
    }

    @Test
    void shouldMapWalletBalanceToResponse() {
        UUID id = UUID.randomUUID();

        WalletBalance balance = WalletBalance.builder()
                .id(id)
                .currentBalance(BigDecimal.valueOf(500))
                .availableBalance(BigDecimal.valueOf(450))
                .frozenBalance(BigDecimal.valueOf(50))
                .pendingBalance(BigDecimal.ZERO)
                .currency("CREDITS")
                .build();

        WalletBalanceResponse response = mapper.toBalanceResponse(balance);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(BigDecimal.valueOf(500), response.getCurrentBalance());
        assertEquals(BigDecimal.valueOf(450), response.getAvailableBalance());
        assertEquals(BigDecimal.valueOf(50), response.getFrozenBalance());
        assertEquals("CREDITS", response.getCurrency());
    }

    @Test
    void shouldMapTransactionToResponse() {
        UUID id = UUID.randomUUID();
        UUID walletId = UUID.randomUUID();

        Wallet wallet = Wallet.builder().id(walletId).build();
        CreditTransaction transaction = CreditTransaction.builder()
                .id(id)
                .wallet(wallet)
                .transactionNumber("TXN-20240101-0001")
                .transactionType(TransactionType.CREDIT_PURCHASE)
                .status(TransactionStatus.COMPLETED)
                .amount(BigDecimal.valueOf(100))
                .balanceBefore(BigDecimal.valueOf(400))
                .balanceAfter(BigDecimal.valueOf(500))
                .currency("CREDITS")
                .description("Credit purchase")
                .referenceId("REF-001")
                .build();

        TransactionResponse response = mapper.toTransactionResponse(transaction);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("TXN-20240101-0001", response.getTransactionNumber());
        assertEquals("CREDIT_PURCHASE", response.getTransactionType());
        assertEquals("COMPLETED", response.getStatus());
        assertEquals(BigDecimal.valueOf(100), response.getAmount());
        assertEquals("Credit purchase", response.getDescription());
    }

    @Test
    void shouldMapLedgerEntryToResponse() {
        UUID id = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        WalletLedger entry = WalletLedger.builder()
                .id(id)
                .entryNumber("LED-20240101-0001")
                .entryType(LedgerEntryType.CREDIT)
                .amount(BigDecimal.valueOf(100))
                .balanceAfter(BigDecimal.valueOf(500))
                .description("Credit entry")
                .referenceId("REF-001")
                .transactionId(transactionId)
                .build();

        LedgerEntryResponse response = mapper.toLedgerEntryResponse(entry);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("LED-20240101-0001", response.getEntryNumber());
        assertEquals("CREDIT", response.getEntryType());
        assertEquals(BigDecimal.valueOf(100), response.getAmount());
        assertEquals(BigDecimal.valueOf(500), response.getBalanceAfter());
    }

    @Test
    void shouldMapRewardToResponse() {
        UUID id = UUID.randomUUID();

        Reward reward = Reward.builder()
                .id(id)
                .rewardType(RewardType.SIGNUP_BONUS)
                .amount(BigDecimal.valueOf(50))
                .description("Welcome bonus")
                .reason("New user signup")
                .redeemed(false)
                .build();

        RewardResponse response = mapper.toRewardResponse(reward);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("SIGNUP_BONUS", response.getRewardType());
        assertEquals(BigDecimal.valueOf(50), response.getAmount());
        assertEquals("Welcome bonus", response.getDescription());
        assertFalse(response.isRedeemed());
    }

    @Test
    void shouldMapStatisticsToResponse() {
        UUID id = UUID.randomUUID();

        WalletStatistics stats = WalletStatistics.builder()
                .id(id)
                .totalTransactions(100)
                .successfulTransactions(95)
                .failedTransactions(5)
                .totalCreditsIn(BigDecimal.valueOf(10000))
                .totalCreditsOut(BigDecimal.valueOf(5000))
                .averageTransactionAmount(BigDecimal.valueOf(150))
                .largestCredit(BigDecimal.valueOf(1000))
                .largestDebit(BigDecimal.valueOf(500))
                .totalRewardsClaimed(10)
                .activeDays(30)
                .build();

        WalletStatisticsResponse response = mapper.toStatisticsResponse(stats);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(100, response.getTotalTransactions());
        assertEquals(95, response.getSuccessfulTransactions());
        assertEquals(BigDecimal.valueOf(10000), response.getTotalCreditsIn());
        assertEquals(BigDecimal.valueOf(5000), response.getTotalCreditsOut());
    }

    @Test
    void shouldReturnNullWhenWalletIsNull() {
        assertNull(mapper.toWalletResponse(null));
    }

    @Test
    void shouldReturnNullWhenBalanceIsNull() {
        assertNull(mapper.toBalanceResponse((WalletBalance) null));
    }

    @Test
    void shouldMapAuditToResponse() {
        UUID id = UUID.randomUUID();

        WalletAudit audit = WalletAudit.builder()
                .id(id)
                .action("WALLET_CREATED")
                .description("Wallet created")
                .performedBy(UUID.randomUUID().toString())
                .ipAddress("192.168.1.1")
                .detailsJson("{\"key\":\"value\"}")
                .build();

        WalletAuditResponse response = mapper.toAuditResponse(audit);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("WALLET_CREATED", response.getAction());
        assertEquals("Wallet created", response.getDescription());
        assertEquals(audit.getPerformedBy(), response.getPerformedBy());
        assertEquals("192.168.1.1", response.getIpAddress());
        assertEquals("{\"key\":\"value\"}", response.getDetailsJson());
    }

    @Test
    void shouldReturnNullWhenTransactionIsNull() {
        assertNull(mapper.toTransactionResponse(null));
    }
}

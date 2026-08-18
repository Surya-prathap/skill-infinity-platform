package com.skillinfinity.wallet.mapper;

import com.skillinfinity.wallet.dto.response.TransactionResponse;
import com.skillinfinity.wallet.dto.response.WalletBalanceResponse;
import com.skillinfinity.wallet.dto.response.WalletResponse;
import com.skillinfinity.wallet.dto.response.WalletAuditResponse;
import com.skillinfinity.wallet.dto.response.WalletStatisticsResponse;
import com.skillinfinity.wallet.entity.CreditTransaction;
import com.skillinfinity.wallet.entity.Wallet;
import com.skillinfinity.wallet.entity.WalletAudit;
import com.skillinfinity.wallet.entity.WalletBalance;
import com.skillinfinity.wallet.entity.WalletStatistics;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WalletMapper {

    @Mapping(target = "status", expression = "java(wallet.getStatus() != null ? wallet.getStatus().name() : null)")
    @Mapping(target = "balance", source = "wallet", qualifiedByName = "toBalanceResponse")
    WalletResponse toWalletResponse(Wallet wallet);

    @Named("toBalanceResponse")
    @Mapping(target = "id", ignore = true)
    WalletBalanceResponse toBalanceResponse(Wallet wallet);

    WalletBalanceResponse toBalanceResponse(WalletBalance balance);

    @Mapping(target = "transactionType", expression = "java(transaction.getTransactionType() != null ? transaction.getTransactionType().name() : null)")
    @Mapping(target = "status", expression = "java(transaction.getStatus() != null ? transaction.getStatus().name() : null)")
    @Mapping(target = "direction", expression = "java(transactionDirection(transaction))")
    TransactionResponse toTransactionResponse(CreditTransaction transaction);

    WalletStatisticsResponse toStatisticsResponse(WalletStatistics statistics);

    /**
     * Maps a transaction to its credit direction so the UI never has to guess:
     * CREDIT = credits gained, DEBIT = credits spent, HOLD = frozen/released
     * (reserved, neither gained nor lost).
     */
    default String transactionDirection(CreditTransaction transaction) {
        if (transaction == null || transaction.getTransactionType() == null) {
            return null;
        }
        return switch (transaction.getTransactionType()) {
            case CREDIT_PURCHASE, CREDIT_REFUND, PROMOTIONAL_CREDIT, REWARD_CREDIT,
                    BONUS_CREDIT, SESSION_PAYMENT, REFERRAL_REWARD, COUPON_REDEMPTION -> "CREDIT";
            case CREDIT_CONSUMPTION, CREDIT_TRANSFER, CREDIT_EXPIRATION, WITHDRAWAL -> "DEBIT";
            case FREEZE, RELEASE -> "HOLD";
            default -> "HOLD";
        };
    }

    WalletAuditResponse toAuditResponse(WalletAudit audit);
}

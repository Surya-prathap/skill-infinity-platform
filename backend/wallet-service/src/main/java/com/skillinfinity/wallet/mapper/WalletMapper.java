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
    TransactionResponse toTransactionResponse(CreditTransaction transaction);

    @Mapping(target = "entryType", expression = "java(entry.getEntryType() != null ? entry.getEntryType().name() : null)")
    LedgerEntryResponse toLedgerEntryResponse(WalletLedger entry);

    @Mapping(target = "rewardType", expression = "java(reward.getRewardType() != null ? reward.getRewardType().name() : null)")
    RewardResponse toRewardResponse(Reward reward);

    WalletStatisticsResponse toStatisticsResponse(WalletStatistics statistics);

    WalletAuditResponse toAuditResponse(WalletAudit audit);
}

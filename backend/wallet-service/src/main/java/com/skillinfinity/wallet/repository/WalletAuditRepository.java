package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.WalletAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WalletAuditRepository extends JpaRepository<WalletAudit, UUID> {

    Page<WalletAudit> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    Page<WalletAudit> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);
}

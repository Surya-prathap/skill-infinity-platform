package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.ModerationAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModerationActionRepository extends JpaRepository<ModerationAction, UUID> {

    Page<ModerationAction> findByAdminIdOrderByCreatedAtDesc(UUID adminId, Pageable pageable);

    Page<ModerationAction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

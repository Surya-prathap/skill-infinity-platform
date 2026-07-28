package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.ModerationAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModerationActionRepository extends JpaRepository<ModerationAction, UUID> {

    Page<ModerationAction> findByModeratorIdAndActiveTrue(UUID moderatorId, Pageable pageable);

    Page<ModerationAction> findByTargetIdAndActiveTrue(UUID targetId, Pageable pageable);
}

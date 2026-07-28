package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, UUID> {

    List<PollOption> findByPollIdAndActiveTrueOrderBySortOrderAsc(UUID pollId);

    Optional<PollOption> findByIdAndPollIdAndActiveTrue(UUID optionId, UUID pollId);

    long countByPollIdAndActiveTrue(UUID pollId);
}

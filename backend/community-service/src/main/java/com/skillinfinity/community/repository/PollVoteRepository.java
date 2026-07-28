package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, UUID> {

    Optional<PollVote> findByPollIdAndUserIdAndOptionIdAndActiveTrue(UUID pollId, UUID userId, UUID optionId);

    boolean existsByPollIdAndUserIdAndActiveTrue(UUID pollId, UUID userId);

    boolean existsByPollIdAndUserIdAndOptionIdAndActiveTrue(UUID pollId, UUID userId, UUID optionId);

    long countByOptionIdAndActiveTrue(UUID optionId);

    long countByPollIdAndActiveTrue(UUID pollId);
}

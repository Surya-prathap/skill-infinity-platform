package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PollRepository extends JpaRepository<Poll, UUID> {

    Optional<Poll> findByPostIdAndActiveTrue(UUID postId);
}

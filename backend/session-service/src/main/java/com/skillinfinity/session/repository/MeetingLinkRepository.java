package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.MeetingLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingLinkRepository extends JpaRepository<MeetingLink, UUID> {

    List<MeetingLink> findBySessionId(UUID sessionId);

    Optional<MeetingLink> findBySessionIdAndActiveTrue(UUID sessionId);

    Optional<MeetingLink> findByMeetingId(String meetingId);

    void deleteBySessionId(UUID sessionId);
}

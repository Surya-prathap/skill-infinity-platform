package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.SessionNotes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionNotesRepository extends JpaRepository<SessionNotes, UUID> {

    List<SessionNotes> findBySessionIdOrderBySortOrderAsc(UUID sessionId);

    List<SessionNotes> findByAuthorId(UUID authorId);

    List<SessionNotes> findBySessionIdAndIsActionItemTrue(UUID sessionId);

    List<SessionNotes> findBySessionIdAndIsPrivateFalse(UUID sessionId);

    void deleteBySessionId(UUID sessionId);
}

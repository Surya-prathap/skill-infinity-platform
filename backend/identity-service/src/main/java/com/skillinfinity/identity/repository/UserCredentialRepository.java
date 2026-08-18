package com.skillinfinity.identity.repository;

import com.skillinfinity.identity.entity.UserCredential;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCredentialRepository extends JpaRepository<UserCredential, UUID> {

    Optional<UserCredential> findByEmail(String email);

    Optional<UserCredential> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<UserCredential> findByEmailAndEnabledTrue(String email);

    /**
     * Locks the user row (SELECT ... FOR UPDATE) so concurrent logins for the
     * same account serialize instead of deadlocking. A login transaction
     * inserts a refresh_tokens row (which takes an S lock on the user row for
     * its FK check) AND updates user_credentials (which wants an X lock). Two
     * overlapping logins each holding the S lock while wanting the X lock is a
     * classic MySQL deadlock — this query takes the X lock up front so the
     * second login simply waits for the first to commit.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from UserCredential u where u.email = :email and u.enabled = true")
    Optional<UserCredential> findByEmailAndEnabledTrueForUpdate(@Param("email") String email);
}

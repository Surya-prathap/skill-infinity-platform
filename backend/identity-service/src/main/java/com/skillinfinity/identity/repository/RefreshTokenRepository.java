package com.skillinfinity.identity.repository;

import com.skillinfinity.identity.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserCredentialId(UUID userCredentialId);

    long countByUserCredentialIdAndRevokedFalse(UUID userCredentialId);

    /** Purges tokens that are already past their expiry (backed by idx_refresh_tokens_expires_at). */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);

    /** Purges revoked tokens that are old enough to be safely forgotten. */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.revoked = true AND rt.createdAt < :cutoff")
    int deleteRevokedBefore(@Param("cutoff") LocalDateTime cutoff);
}

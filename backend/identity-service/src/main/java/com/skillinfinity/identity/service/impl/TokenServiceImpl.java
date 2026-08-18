package com.skillinfinity.identity.service.impl;

import com.skillinfinity.identity.entity.RefreshToken;
import com.skillinfinity.identity.entity.UserCredential;
import com.skillinfinity.identity.repository.RefreshTokenRepository;
import com.skillinfinity.identity.security.JwtTokenProvider;
import com.skillinfinity.identity.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public String createAccessToken(UserCredential user) {
        return jwtTokenProvider.generateAccessToken(user);
    }

    @Override
    public String createRefreshToken(UserCredential user) {
        String token = jwtTokenProvider.generateRefreshToken(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userCredential(user)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return token;
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
            log.info("Refresh token revoked");
        });
    }
}

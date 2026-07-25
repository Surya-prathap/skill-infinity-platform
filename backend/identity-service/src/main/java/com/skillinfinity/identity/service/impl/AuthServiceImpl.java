package com.skillinfinity.identity.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.identity.dto.request.ChangePasswordRequest;
import com.skillinfinity.identity.dto.request.LoginRequest;
import com.skillinfinity.identity.dto.request.RefreshTokenRequest;
import com.skillinfinity.identity.dto.request.RegisterRequest;
import com.skillinfinity.identity.dto.response.AuthResponse;
import com.skillinfinity.identity.dto.response.TokenValidationResponse;
import com.skillinfinity.identity.dto.response.UserInfoResponse;
import com.skillinfinity.identity.entity.RefreshToken;
import com.skillinfinity.identity.entity.Role;
import com.skillinfinity.identity.entity.UserCredential;
import com.skillinfinity.identity.repository.RefreshTokenRepository;
import com.skillinfinity.identity.repository.RoleRepository;
import com.skillinfinity.identity.repository.UserCredentialRepository;
import com.skillinfinity.identity.security.JwtTokenProvider;
import com.skillinfinity.identity.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserCredentialRepository userCredentialRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userCredentialRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: email already exists - {}", request.getEmail());
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        if (request.getUsername() != null && userCredentialRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: username already exists - {}", request.getUsername());
            throw new BadRequestException("Username already taken: " + request.getUsername());
        }

        Role learnerRole = roleRepository.findByName("ROLE_LEARNER")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_LEARNER"));

        UserCredential user = UserCredential.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername() != null ? request.getUsername() : generateUsername(request.getEmail()))
                .roles(new HashSet<>(Set.of(learnerRole)))
                .build();

        user = userCredentialRepository.save(user);
        log.info("User registered successfully: {} with id: {}", user.getEmail(), user.getId());

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        saveRefreshToken(user, refreshToken);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            log.warn("Login failed: invalid credentials for email: {}", request.getEmail());
            throw new BadRequestException("Invalid email or password");
        }

        UserCredential user = userCredentialRepository.findByEmailAndEnabledTrue(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Account is disabled or not found"));

        user.setLastLoginAt(LocalDateTime.now());
        user.setLoginAttempts(0);
        userCredentialRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        saveRefreshToken(user, refreshToken);

        log.info("User logged in successfully: {}", user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue != null && !refreshTokenValue.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
                log.info("Refresh token revoked for user");
            });
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (storedToken.isRevoked()) {
            log.warn("Refresh token has been revoked");
            throw new BadRequestException("Refresh token has been revoked");
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Refresh token has expired");
            throw new BadRequestException("Refresh token has expired");
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        UserCredential user = storedToken.getUserCredential();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        saveRefreshToken(user, newRefreshToken);

        log.info("Tokens refreshed for user: {}", user.getEmail());
        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Override
    public TokenValidationResponse validateToken(String token) {
        boolean valid = jwtTokenProvider.validateToken(token);
        if (!valid) {
            return TokenValidationResponse.builder()
                    .valid(false)
                    .message("Token is invalid or expired")
                    .build();
        }

        try {
            UUID userId = jwtTokenProvider.getUserIdFromToken(token);
            UserCredential user = userCredentialRepository.findById(userId)
                    .orElse(null);

            if (user == null) {
                return TokenValidationResponse.builder()
                        .valid(false)
                        .message("User not found")
                        .build();
            }

            return TokenValidationResponse.builder()
                    .valid(true)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .message("Token is valid")
                    .build();
        } catch (Exception e) {
            return TokenValidationResponse.builder()
                    .valid(false)
                    .message("Token validation failed")
                    .build();
        }
    }

    @Override
    public UserInfoResponse getCurrentUser(String userId) {
        UserCredential user = userCredentialRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        UserCredential user = userCredentialRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Password change failed: incorrect current password for user: {}", userId);
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userCredentialRepository.save(user);

        log.info("Password changed successfully for user: {}", userId);
    }

    @Override
    public void forgotPassword(String email) {
        if (!userCredentialRepository.existsByEmail(email)) {
            log.warn("Password reset requested for non-existent email: {}", email);
            // Don't reveal whether the email exists for security
            return;
        }
        log.info("Password reset requested for email: {} (architecture ready)", email);
        // Architecture ready: implement email sending in a future phase
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Password reset with token: {} (architecture ready)", token);
        // Architecture ready: implement token validation and password reset
    }

    private void saveRefreshToken(UserCredential user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userCredential(user)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenExpiration() / 1000 * 7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(UserCredential user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .tokenType("Bearer")
                .build();
    }

    private String generateUsername(String email) {
        String base = email.substring(0, email.indexOf('@'));
        String username = base;
        int suffix = 1;
        while (userCredentialRepository.existsByUsername(username)) {
            username = base + suffix++;
        }
        return username;
    }
}

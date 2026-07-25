package com.skillinfinity.identity.service;

import com.skillinfinity.identity.dto.request.ChangePasswordRequest;
import com.skillinfinity.identity.dto.request.LoginRequest;
import com.skillinfinity.identity.dto.request.RefreshTokenRequest;
import com.skillinfinity.identity.dto.request.RegisterRequest;
import com.skillinfinity.identity.dto.response.AuthResponse;
import com.skillinfinity.identity.dto.response.TokenValidationResponse;
import com.skillinfinity.identity.dto.response.UserInfoResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void logout(String refreshToken);

    AuthResponse refreshToken(RefreshTokenRequest request);

    TokenValidationResponse validateToken(String token);

    UserInfoResponse getCurrentUser(String userId);

    void changePassword(String userId, ChangePasswordRequest request);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);
}

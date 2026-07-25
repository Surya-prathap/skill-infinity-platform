package com.skillinfinity.identity.service;

import com.skillinfinity.identity.entity.UserCredential;

public interface TokenService {

    String createAccessToken(UserCredential user);

    String createRefreshToken(UserCredential user);

    void revokeRefreshToken(String token);
}

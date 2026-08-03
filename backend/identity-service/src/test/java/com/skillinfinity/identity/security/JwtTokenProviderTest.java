package com.skillinfinity.identity.security;

import com.skillinfinity.identity.entity.Role;
import com.skillinfinity.identity.entity.UserCredential;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    private static final String SECRET = "4a6f686e446f6553656372657456657279566572795365637265744b6579466f724a57545369676e696e67416e64456e6372797074696f6e";
    private static final long ACCESS_EXPIRATION = 900000; // 15 minutes
    private static final long REFRESH_EXPIRATION = 604800000; // 7 days

    private JwtTokenProvider jwtTokenProvider;
    private UserCredential testUser;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, ACCESS_EXPIRATION, REFRESH_EXPIRATION);

        Role role = new Role();
        role.setName("ROLE_LEARNER");

        testUser = UserCredential.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .username("testuser")
                .roles(Set.of(role))
                .build();
    }

    @Nested
    @DisplayName("Access Token Tests")
    class AccessTokenTests {

        @Test
        @DisplayName("Should generate valid access token")
        void generateAccessToken_ShouldCreateValidToken() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            assertNotNull(token);
            assertFalse(token.isBlank());
            assertTrue(jwtTokenProvider.validateToken(token));
        }

        @Test
        @DisplayName("Should extract user ID from token")
        void getUserIdFromToken_ShouldReturnCorrectUserId() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            UUID extractedUserId = jwtTokenProvider.getUserIdFromToken(token);
            assertEquals(testUser.getId(), extractedUserId);
        }

        @Test
        @DisplayName("Should extract email from token")
        void getEmailFromToken_ShouldReturnCorrectEmail() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            String email = jwtTokenProvider.getEmailFromToken(token);
            assertEquals("test@example.com", email);
        }

        @Test
        @DisplayName("Should extract roles from token")
        void getRolesFromToken_ShouldReturnCorrectRoles() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            List<String> roles = jwtTokenProvider.getRolesFromToken(token);
            assertTrue(roles.contains("ROLE_LEARNER"));
            assertEquals(1, roles.size());
        }

        @Test
        @DisplayName("Should reject expired token")
        void validateToken_ExpiredToken_ShouldReturnFalse() {
            // Create provider with expired token
            JwtTokenProvider expiredProvider = new JwtTokenProvider(SECRET, 1, 1);
            String token = expiredProvider.generateAccessToken(testUser);

            // Wait for token to expire
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            assertFalse(expiredProvider.validateToken(token));
        }

        @Test
        @DisplayName("Should reject invalid token")
        void validateToken_InvalidToken_ShouldReturnFalse() {
            assertFalse(jwtTokenProvider.validateToken("invalid-token-here"));
            assertFalse(jwtTokenProvider.validateToken(""));
            assertFalse(jwtTokenProvider.validateToken(null));
        }

        @Test
        @DisplayName("Should reject tampered token")
        void validateToken_TamperedToken_ShouldReturnFalse() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";
            assertFalse(jwtTokenProvider.validateToken(tamperedToken));
        }
    }

    @Nested
    @DisplayName("Refresh Token Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should generate valid refresh token")
        void generateRefreshToken_ShouldCreateValidToken() {
            String token = jwtTokenProvider.generateRefreshToken(testUser.getId());
            assertNotNull(token);
            assertFalse(token.isBlank());
            assertTrue(jwtTokenProvider.validateToken(token));
        }

        @Test
        @DisplayName("Should extract user ID from refresh token")
        void getUserIdFromRefreshToken() {
            String token = jwtTokenProvider.generateRefreshToken(testUser.getId());
            UUID extractedUserId = jwtTokenProvider.getUserIdFromToken(token);
            assertEquals(testUser.getId(), extractedUserId);
        }
    }

    @Test
    @DisplayName("Should return correct access token expiration")
    void getAccessTokenExpiration() {
        assertEquals(ACCESS_EXPIRATION, jwtTokenProvider.getAccessTokenExpiration());
    }
}

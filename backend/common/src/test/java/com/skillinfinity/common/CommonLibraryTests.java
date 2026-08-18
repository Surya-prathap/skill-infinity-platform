package com.skillinfinity.common;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.util.MaskingUtil;
import com.skillinfinity.common.util.StringUtil;
import com.skillinfinity.common.util.UUIDUtil;
import com.skillinfinity.common.util.DateTimeUtil;
import com.skillinfinity.common.validation.ValidationUtil;
import com.skillinfinity.common.logging.LoggingUtil;
import com.skillinfinity.common.constant.ServiceConstants;
import com.skillinfinity.common.constant.SecurityConstants;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = CommonLibraryTests.TestConfig.class)
@ActiveProfiles("test")
class CommonLibraryTests {

    @Test
    void contextLoads() {
    }

    // ============================================================
    // ApiResponse Tests
    // ============================================================
    @Test
    void apiResponse_Success_ShouldReturnValidResponse() {
        ApiResponse<String> response = ApiResponse.success("test data");
        assertTrue(response.success());
        assertEquals("test data", response.data());
        assertNotNull(response.timestamp());
        assertNotNull(response.requestId());
    }

    @Test
    void apiResponse_SuccessWithMessage_ShouldIncludeMessage() {
        ApiResponse<String> response = ApiResponse.success("Custom message", "data");
        assertTrue(response.success());
        assertEquals("Custom message", response.message());
        assertEquals("data", response.data());
    }

    @Test
    void apiResponse_Error_ShouldReturnErrorResponse() {
        ApiResponse<String> response = ApiResponse.error("Error occurred");
        assertFalse(response.success());
        assertEquals("Error occurred", response.message());
        assertNull(response.data());
    }

    // ============================================================
    // MaskingUtil Tests
    // ============================================================
    @Test
    void maskEmail_ShouldMaskCorrectly() {
        assertEquals("j***@example.com", MaskingUtil.maskEmail("john@example.com"));
        assertEquals("a***@test.com", MaskingUtil.maskEmail("ab@test.com"));
        assertEquals("****", MaskingUtil.maskEmail(null));
        assertEquals("****", MaskingUtil.maskEmail("invalid"));
    }

    @Test
    void maskPhone_ShouldShowLast4Digits() {
        assertEquals("****5678", MaskingUtil.maskPhone("123456789012345678"));
        assertEquals("****", MaskingUtil.maskPhone("123"));
        assertEquals("****", MaskingUtil.maskPhone(null));
    }

    @Test
    void maskCreditCard_ShouldShowLast4Digits() {
        assertEquals("****-1111", MaskingUtil.maskCreditCard("4111111111111111"));
        assertEquals("****", MaskingUtil.maskCreditCard("123"));
        assertEquals("****", MaskingUtil.maskCreditCard(null));
    }

    @Test
    void maskToken_ShouldShowFirstAndLast10Chars() {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNqPms9GMEfJ";
        String masked = MaskingUtil.maskToken(token);
        assertTrue(masked.startsWith("eyJhbGciOi"));
        assertTrue(masked.endsWith("MEfJ"));
        assertEquals(token.substring(0,10) + "..." + token.substring(token.length() - 10), masked);
    }

    @Test
    void maskPassword_ShouldAlwaysReturnMasked() {
        assertEquals("****", MaskingUtil.maskPassword());
    }

    // ============================================================
    // StringUtil Tests
    // ============================================================
    @Test
    void stringUtil_IsNotBlank_ShouldReturnCorrectBoolean() {
        assertTrue(StringUtil.isNotBlank("test"));
        assertFalse(StringUtil.isNotBlank(""));
        assertFalse(StringUtil.isNotBlank(null));
        assertFalse(StringUtil.isNotBlank("   "));
    }

    @Test
    void stringUtil_Truncate_ShouldHandleVariousCases() {
        assertEquals("Hel...", StringUtil.truncate("Hello World", 3));
        assertEquals("Hello World", StringUtil.truncate("Hello World", 20));
        assertNull(StringUtil.truncate(null, 5));
    }

    @Test
    void stringUtil_Sanitize_ShouldRemoveDangerousCharacters() {
        String result = StringUtil.sanitize("<script>alert('xss')</script>");
        assertFalse(result.contains("<"));
        assertFalse(result.contains(">"));
        assertFalse(result.contains("'"));
    }

    // ============================================================
    // UUIDUtil Tests
    // ============================================================
    @Test
    void uuidUtil_Generate_ShouldReturnValidUUID() {
        UUID uuid = UUIDUtil.generate();
        assertNotNull(uuid);
        assertEquals(36, uuid.toString().length());
    }

    @Test
    void uuidUtil_GenerateString_ShouldReturnValidUUIDString() {
        String uuidStr = UUIDUtil.generateString();
        assertNotNull(uuidStr);
        assertEquals(36, uuidStr.length());
        assertDoesNotThrow(() -> UUID.fromString(uuidStr));
    }

    // ============================================================
    // DateTimeUtil Tests
    // ============================================================
    @Test
    void dateTimeUtil_FormatDefault_ShouldReturnFormattedString() {
        String formatted = DateTimeUtil.formatDefault(LocalDateTime.of(2026, 1, 15, 10, 30, 0));
        assertEquals("2026-01-15T10:30:00", formatted);
    }

    @Test
    void dateTimeUtil_Now_ShouldReturnCurrentDateTime() {
        assertNotNull(DateTimeUtil.now());
    }

    // ============================================================
    // ServiceConstants Tests
    // ============================================================
    @Test
    void serviceConstants_ShouldHaveAllServiceNames() {
        assertEquals("identity-service", ServiceConstants.IDENTITY_SERVICE);
        assertEquals("user-service", ServiceConstants.USER_SERVICE);
        assertEquals("mentor-service", ServiceConstants.MENTOR_SERVICE);
        assertEquals("session-service", ServiceConstants.SESSION_SERVICE);
        assertEquals("wallet-service", ServiceConstants.WALLET_SERVICE);
        assertEquals("payment-service", ServiceConstants.PAYMENT_SERVICE);
        assertEquals("review-service", ServiceConstants.REVIEW_SERVICE);
        assertEquals("admin-service", ServiceConstants.ADMIN_SERVICE);
        assertEquals("api-gateway", ServiceConstants.API_GATEWAY);
        assertEquals("config-server", ServiceConstants.CONFIG_SERVER);
        assertEquals("discovery-server", ServiceConstants.DISCOVERY_SERVER);
    }

    @Test
    void serviceConstants_ShouldHaveApiPaths() {
        assertEquals("/api/v1/auth", ServiceConstants.IDENTITY_API);
        assertEquals("/api/v1/users", ServiceConstants.USER_API);
        assertEquals("/api/v1/mentors", ServiceConstants.MENTOR_API);
        assertEquals("/api/v1/sessions", ServiceConstants.SESSION_API);
        assertEquals("/api/v1/wallet", ServiceConstants.WALLET_API);
        assertEquals("/api/v1/payments", ServiceConstants.PAYMENT_API);
    }

    // ============================================================
    // SecurityConstants Tests
    // ============================================================
    @Test
    void securityConstants_ShouldHaveValidValues() {
        assertNotNull(SecurityConstants.JWT_PREFIX);
        assertNotNull(SecurityConstants.ROLE_PREFIX);
        assertNotNull(SecurityConstants.HEADER_STRING);
        assertNotNull(SecurityConstants.TOKEN_PREFIX);
    }

    // ============================================================
    // LoggingUtil Tests
    // ============================================================
    @Test
    void loggingUtil_StartCorrelation_ShouldReturnValidString() {
        String correlationId = LoggingUtil.startCorrelation();
        assertNotNull(correlationId);
        assertFalse(correlationId.isBlank());
        LoggingUtil.clear();
    }

    @Test
    void loggingUtil_SetAndClear_ShouldNotThrowExceptions() {
        assertDoesNotThrow(() -> {
            LoggingUtil.setCorrelationId("test-correlation");
            LoggingUtil.setServiceName("test-service");
            LoggingUtil.setUserId("test-user");
            LoggingUtil.clear();
        });
    }

    // ============================================================
    // ValidationUtil Tests
    // ============================================================
    @Test
    void validationUtil_IsValidEmail_ShouldValidateCorrectly() {
        ValidationUtil.isValidEmail("test@example.com");
        ValidationUtil.isValidEmail("user.name+tag@domain.co.uk");
    }

    // ============================================================
    // Main Application Test (noop, just loads context)
    // ============================================================
    static class TestConfig {
    }
}

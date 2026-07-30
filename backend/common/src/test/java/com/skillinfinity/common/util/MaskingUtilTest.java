package com.skillinfinity.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("MaskingUtil Tests")
class MaskingUtilTest {

    @Nested
    @DisplayName("Email Masking")
    class EmailMasking {

        @ParameterizedTest
        @CsvSource({
            "john.doe@example.com, j***@example.com",
            "a@b.com, a***@b.com",
            "test@test.co.uk, t***@test.co.uk"
        })
        void maskEmail_ShouldMaskCorrectly(String input, String expected) {
            assertEquals(expected, MaskingUtil.maskEmail(input));
        }

        @Test
        void maskEmail_NullInput_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskEmail(null));
        }

        @Test
        void maskEmail_NoAtSymbol_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskEmail("invalid"));
        }
    }

    @Nested
    @DisplayName("Phone Masking")
    class PhoneMasking {

        @Test
        void maskPhone_ShouldShowLast4Digits() {
            assertEquals("****7890", MaskingUtil.maskPhone("1234567890"));
        }

        @Test
        void maskPhone_ShortInput_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskPhone("123"));
        }

        @Test
        void maskPhone_NullInput_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskPhone(null));
        }
    }

    @Nested
    @DisplayName("Credit Card Masking")
    class CreditCardMasking {

        @Test
        void maskCreditCard_ShouldShowLast4Digits() {
            assertEquals("****-1111", MaskingUtil.maskCreditCard("4111111111111111"));
        }

        @Test
        void maskCreditCard_WithSpaces_ShouldHandleCleaning() {
            assertEquals("****-1234", MaskingUtil.maskCreditCard("4111 1111 1111 1234"));
        }

        @Test
        void maskCreditCard_NullInput_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskCreditCard(null));
        }
    }

    @Nested
    @DisplayName("Token Masking")
    class TokenMasking {

        @Test
        void maskToken_ShouldShowFirstAndLast10Chars() {
            String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNqPms9GMEfJ";
            String masked = MaskingUtil.maskToken(token);
            assertTrue(masked.startsWith("eyJhbGciOi"));
            assertTrue(masked.contains("..."));
        }

        @Test
        void maskToken_ShortToken_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskToken("short"));
        }

        @Test
        void maskToken_NullInput_ReturnsMask() {
            assertEquals("****", MaskingUtil.maskToken(null));
        }
    }

    @Test
    void maskPassword_AlwaysReturnsMasked() {
        assertEquals("****", MaskingUtil.maskPassword());
    }
}

package com.skillinfinity.common;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.ErrorResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.dto.ValidationError;
import com.skillinfinity.common.enums.UserRole;
import com.skillinfinity.common.enums.ErrorCode;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
import com.skillinfinity.common.validation.ValidationUtil;
import com.skillinfinity.common.util.StringUtil;
import com.skillinfinity.common.util.UUIDUtil;
import com.skillinfinity.common.util.MaskingUtil;
import com.skillinfinity.common.util.PaginationUtil;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CommonLibraryTests {

    @Test
    void apiResponseSuccess() {
        ApiResponse<String> response = ApiResponse.success("test data");
        assertThat(response.success()).isTrue();
        assertThat(response.data()).isEqualTo("test data");
        assertThat(response.timestamp()).isNotNull();
    }

    @Test
    void apiResponseError() {
        ApiResponse<String> response = ApiResponse.error("Something went wrong");
        assertThat(response.success()).isFalse();
        assertThat(response.message()).isEqualTo("Something went wrong");
    }

    @Test
    void errorResponseCreation() {
        ErrorResponse response = ErrorResponse.of("Test error", "/test", "req-123");
        assertThat(response.message()).isEqualTo("Test error");
        assertThat(response.path()).isEqualTo("/test");
        assertThat(response.requestId()).isEqualTo("req-123");
    }

    @Test
    void pageResponseCreation() {
        List<String> items = List.of("a", "b", "c");
        PageResponse<String> response = PageResponse.of(items, 1, 10, 3);
        assertThat(response.content()).hasSize(3);
        assertThat(response.page()).isEqualTo(1);
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.totalElements()).isEqualTo(3);
        assertThat(response.totalPages()).isEqualTo(1);
        assertThat(response.first()).isTrue();
        assertThat(response.last()).isTrue();
    }

    @Test
    void validationErrorRecord() {
        ValidationError error = new ValidationError("email", "must be a valid email");
        assertThat(error.field()).isEqualTo("email");
        assertThat(error.message()).isEqualTo("must be a valid email");
    }

    @Test
    void userRoleEnum() {
        assertThat(UserRole.valueOf("ROLE_ADMIN")).isEqualTo(UserRole.ROLE_ADMIN);
        assertThat(UserRole.valueOf("ROLE_MENTOR")).isEqualTo(UserRole.ROLE_MENTOR);
        assertThat(UserRole.valueOf("ROLE_LEARNER")).isEqualTo(UserRole.ROLE_LEARNER);
    }

    @Test
    void errorCodeEnum() {
        assertThat(ErrorCode.valueOf("INTERNAL_ERROR")).isEqualTo(ErrorCode.INTERNAL_ERROR);
        assertThat(ErrorCode.valueOf("VALIDATION_ERROR")).isEqualTo(ErrorCode.VALIDATION_ERROR);
        assertThat(ErrorCode.valueOf("NOT_FOUND")).isEqualTo(ErrorCode.NOT_FOUND);
    }

    @Test
    void validationUtilEmail() {
        assertThat(ValidationUtil.isValidEmail("user@example.com")).isTrue();
        assertThat(ValidationUtil.isValidEmail("invalid")).isFalse();
        assertThat(ValidationUtil.isValidEmail(null)).isFalse();
    }

    @Test
    void validationUtilPhone() {
        assertThat(ValidationUtil.isValidPhone("+1234567890")).isTrue();
        assertThat(ValidationUtil.isValidPhone("abc")).isFalse();
    }

    @Test
    void stringUtilOperations() {
        assertThat(StringUtil.isBlank(null)).isTrue();
        assertThat(StringUtil.isBlank("")).isTrue();
        assertThat(StringUtil.isBlank("hello")).isFalse();
        assertThat(StringUtil.isNotBlank("hello")).isTrue();
        assertThat(StringUtil.truncate("Hello World", 5)).isEqualTo("Hello...");
        assertThat(StringUtil.generateId()).isNotNull();
    }

    @Test
    void uuidUtilOperations() {
        String uuid = UUIDUtil.generateAsString();
        assertThat(UUIDUtil.isValid(uuid)).isTrue();
        assertThat(UUIDUtil.isValid("not-a-uuid")).isFalse();
        assertThat(UUIDUtil.isValid(null)).isFalse();
    }

    @Test
    void maskingUtilOperations() {
        assertThat(MaskingUtil.maskEmail("john@example.com")).isEqualTo("j***@example.com");
        assertThat(MaskingUtil.maskPhone("+1234567890")).contains("****");
        assertThat(MaskingUtil.maskPassword()).isEqualTo("****");
    }

    @Test
    void paginationUtilOperations() {
        assertThat(PaginationUtil.calculateOffset(1, 10)).isZero();
        assertThat(PaginationUtil.calculateOffset(2, 10)).isEqualTo(10);
        assertThat(PaginationUtil.calculateTotalPages(25, 10)).isEqualTo(3);
        assertThat(PaginationUtil.normalizePage(0)).isEqualTo(1);
        assertThat(PaginationUtil.normalizePage(2)).isEqualTo(2);
    }

    @Test
    void exceptions() {
        assertThat(new ResourceNotFoundException("User", "id", "123"))
                .isInstanceOf(RuntimeException.class);
        assertThat(new BadRequestException("Invalid input"))
                .isInstanceOf(RuntimeException.class);
    }
}

# Skill Infinity - Common Library

## Purpose

The Common Library is a shared Maven module containing reusable code used by all microservices in the Skill Infinity platform. It eliminates code duplication and ensures consistent patterns across the entire system.

## Architecture

The library is organized into the following packages:

| Package | Description |
|---------|-------------|
| `config` | Shared Spring configuration and beans |
| `constant` | Application-wide constants (security, service names) |
| `dto` | API response models (ApiResponse, ErrorResponse, PageResponse) |
| `dto.request` | Base request DTO classes |
| `dto.response` | Success response wrapper |
| `enums` | Common enumerations (UserRole, AccountStatus, etc.) |
| `exception` | Custom exceptions and global exception handler |
| `event` | Base event classes for RabbitMQ communication |
| `filter` | Reusable servlet filters (RequestTracingFilter) |
| `logging` | Structured logging utilities with MDC support |
| `mapper` | Base mapper interface for MapStruct |
| `util` | Utility classes (StringUtil, UUIDUtil, DateTimeUtil, etc.) |
| `validation` | Reusable validation utilities and regex constants |
| `annotation` | Custom annotations (CurrentUser, LogExecutionTime) |

## Usage

### Add Dependency

```xml
<dependency>
    <groupId>com.skillinfinity</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### Examples

```java
// Response models
ApiResponse<UserResponse> response = ApiResponse.success(userData);
ApiResponse.error("Validation failed");

// Exceptions
throw new ResourceNotFoundException("User", "id", userId);
throw new BadRequestException("Invalid email format");

// Enums
UserRole role = UserRole.ROLE_LEARNER;

// Validation
boolean valid = ValidationUtil.isValidEmail("user@example.com");

// Utilities
String uuid = UUIDUtil.generateAsString();
String masked = MaskingUtil.maskEmail("john@example.com");
```

## Best Practices

- Never add business-specific logic to the Common Library
- Keep utility classes stateless and static
- Use records for DTOs where appropriate
- All public types must have JavaDoc
- Test all utility methods

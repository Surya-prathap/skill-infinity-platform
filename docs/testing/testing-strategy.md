# Testing Strategy

## Overview

The Skill Infinity Platform implements a comprehensive testing strategy across multiple levels to ensure production readiness, reliability, and security.

## Test Pyramid

```
        ⬆️
     / E2E \       Few
    /-------\
   /Integration\   Some
  /--------------\
 /   Unit Tests   \  Many
/------------------\
```

## Test Types

### Unit Tests
- **Scope**: Individual classes, methods, and functions
- **Framework**: JUnit 5, Mockito
- **Target Coverage**: 90%+ business logic
- **Run Time**: < 10 seconds per module

### Integration Tests
- **Scope**: Service interactions with databases, message queues, caches
- **Framework**: Spring Boot Test, Testcontainers
- **Target Coverage**: 80%+ integration paths
- **Key Areas**: Database operations, Redis caching, RabbitMQ messaging

### Repository Tests
- **Scope**: JPA repository operations, custom queries
- **Framework**: Spring Data JPA Test, H2 database (test), Testcontainers (CI)
- **Key Tests**: CRUD operations, custom queries, pagination, sorting

### Controller Tests
- **Scope**: REST API endpoints, request/response validation, HTTP status codes
- **Framework**: MockMvc, WebTestClient
- **Key Tests**: Success scenarios, validation errors, authentication, authorization

### Service Tests
- **Scope**: Business logic, transaction boundaries, event publishing
- **Framework**: Spring Boot Test, Mockito
- **Key Tests**: Business rule validation, exception handling, event propagation

### Mapper Tests
- **Scope**: Entity-to-DTO and DTO-to-Entity mapping
- **Framework**: MapStruct, JUnit 5
- **Key Tests**: Field mapping, null handling, nested object mapping

### Validation Tests
- **Scope**: Input validation, bean validation annotations
- **Framework**: Jakarta Validation, JUnit 5
- **Key Tests**: Required fields, format validation, length constraints

### Security Tests
- **Scope**: Authentication, authorization, token validation
- **Framework**: Spring Security Test, MockMvc
- **Key Tests**: Public endpoints accessible, secured endpoints blocked, role-based access

### JWT Tests
- **Scope**: Token generation, validation, expiration
- **Framework**: JUnit 5, Mockito
- **Key Tests**: Token creation, signature validation, expiry handling, role extraction

### RabbitMQ Tests
- **Scope**: Message publishing, consumption, retry logic
- **Framework**: Spring Rabbit Test, Testcontainers
- **Key Tests**: Message serialization, queue binding, consumer acknowledgment

### Redis Cache Tests
- **Scope**: Cache operations, TTL, eviction
- **Framework**: Embedded Redis, Spring Cache Test
- **Key Tests**: Cache put/get, TTL expiration, cache eviction

### API Gateway Tests
- **Scope**: Route validation, filter execution, header propagation
- **Framework**: Spring Cloud Gateway Test, WebTestClient
- **Key Tests**: Route matching, filter chaining, correlation ID propagation

### Docker Startup Tests
- **Scope**: Container startup, health checks, dependency ordering
- **Framework**: Docker Compose, shell scripts
- **Key Tests**: All services start, health endpoints respond, dependencies satisfied

### Context Load Tests
- **Scope**: Spring context loading for each service
- **Framework**: Spring Boot Test
- **Key Tests**: Application context loads, all beans created, no configuration errors

## Test Configuration

Each service uses an `application-test.yml` with:
- H2 in-memory database (MySQL mode)
- Disabled config server (mock fallback)
- Disabled Eureka client
- Mock Redis/RabbitMQ (autoconfiguration excluded)
- Test-specific logging levels

## CI Pipeline Integration

Tests are executed in the CI pipeline:
1. **Compile** → Check compilation
2. **Unit Tests** → Fast feedback
3. **Integration Tests** → Longer-running tests
4. **Coverage** → JaCoCo report generation
5. **Security Tests** → Authentication/authorization validation

## Coverage Targets

| Module | Unit Test | Integration | Overall |
|--------|-----------|-------------|---------|
| Common Library | 90% | - | 90% |
| Config Server | 80% | 70% | 75% |
| Discovery Server | 80% | 70% | 75% |
| API Gateway | 85% | 75% | 80% |
| Identity Service | 90% | 80% | 85% |
| User Service | 90% | 80% | 85% |
| Mentor Service | 90% | 80% | 85% |
| Session Service | 90% | 80% | 85% |
| Wallet Service | 90% | 80% | 85% |
| Payment Service | 90% | 80% | 85% |
| Review Service | 90% | 80% | 85% |
| Admin Service | 85% | 75% | 80% |
| **Platform Average** | **87%** | **77%** | **82%** |

## Running Tests

```bash
# Run all tests
cd backend && mvn clean test

# Run tests for specific module
cd backend && mvn test -pl identity-service

# Run specific test class
cd backend && mvn test -pl identity-service -Dtest=AuthServiceImplTest

# Run with coverage report
cd backend && mvn clean test jacoco:report

# Skip tests (build only)
cd backend && mvn clean install -DskipTests
```

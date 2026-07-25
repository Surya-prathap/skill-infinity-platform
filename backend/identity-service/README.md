# Skill Infinity - Identity Service

## Purpose

The Identity Service manages authentication, authorization, and user identity for the Skill Infinity platform. It provides JWT-based stateless authentication with refresh token rotation and Role-Based Access Control (RBAC).

## Responsibilities

- User registration with email and password
- JWT access token generation and validation
- Refresh token management with rotation
- Password encryption using BCrypt
- Role-Based Access Control (ROLE_ADMIN, ROLE_MENTOR, ROLE_LEARNER)
- Password change, forgot/reset password (architecture ready)
- Email verification (architecture ready)

## Architecture

```
Client → API Gateway → Identity Service (:8081) → MySQL (identity_db)
                              │
                              ├── JWT Token Provider
                              ├── Spring Security (stateless)
                              └── Eureka Client
```

## Database

| Schema | Purpose |
|--------|---------|
| `identity_db` | User credentials, roles, permissions, refresh tokens |

### Tables
- `user_credentials` — User accounts with encrypted passwords
- `refresh_tokens` — Long-lived refresh tokens with revocation support
- `roles` — RBAC roles (ADMIN, MENTOR, LEARNER)
- `permissions` — Fine-grained permissions (architecture ready)
- `user_credential_roles` — Many-to-many user-role mapping

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Spring Cloud Config Client | Configuration from Config Server |
| Spring Cloud Eureka Client | Service registration with Eureka |
| Spring Data JPA | Database access |
| Spring Security | Authentication, authorization, JWT |
| MySQL Connector | MySQL database driver |
| Spring Validation | Input validation |
| Spring Boot Actuator | Health checks, metrics |
| Springdoc OpenAPI | API documentation |
| JJWT | JWT token creation and validation |
| Lombok | Boilerplate reduction |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `IDENTITY_SERVICE_PORT` | `8081` | Server port |
| `IDENTITY_DB_HOST` | `localhost` | Database host |
| `IDENTITY_DB_PORT` | `3306` | Database port |
| `IDENTITY_DB_NAME` | `identity_db` | Database name |
| `IDENTITY_DB_USERNAME` | `root` | Database username |
| `IDENTITY_DB_PASSWORD` | `root` | Database password |
| `JWT_SECRET` | *(required)* | JWT signing secret |
| `JWT_ACCESS_EXPIRY` | `900000` | Access token TTL (ms) |
| `JWT_REFRESH_EXPIRY` | `604800000` | Refresh token TTL (ms) |
| `EUREKA_DEFAULT_ZONE` | `http://localhost:8761/eureka/` | Eureka URL |
| `CONFIG_SERVER_URL` | `http://localhost:8888` | Config Server URL |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Authenticate and get tokens |
| POST | `/api/v1/auth/logout` | No | Revoke refresh token |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/validate` | No | Validate access token |
| GET | `/api/v1/auth/me` | Yes | Get current user info |
| POST | `/api/v1/auth/change-password` | Yes | Change password |
| POST | `/api/v1/auth/forgot-password` | No | Request password reset |
| POST | `/api/v1/auth/reset-password` | No | Reset password with token |

## Swagger

- Swagger UI: http://localhost:8081/swagger-ui.html
- API Docs: http://localhost:8081/v3/api-docs

## Running Instructions

```bash
# Build
cd backend && mvn clean install -pl identity-service -am

# Run
cd identity-service && mvn spring-boot:run

# With custom profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Testing

```bash
cd backend && mvn test -pl identity-service
```

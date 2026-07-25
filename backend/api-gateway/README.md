# Skill Infinity - API Gateway

## Purpose

The API Gateway is the single entry point for all client requests to the Skill Infinity platform. It routes requests to appropriate microservices, handles cross-cutting concerns (logging, correlation IDs, CORS), and prepares for future authentication and rate limiting.

## Responsibilities

- Route requests to appropriate microservices via Eureka service discovery
- Add correlation IDs to all requests for distributed tracing
- Log incoming requests and outgoing responses
- Handle CORS for frontend applications
- Provide consistent error responses
- Prepare for JWT authentication (Day 2)
- Expose actuator endpoints for health monitoring

## Architecture

```
Client (Browser/App) → API Gateway (:8080) → Eureka Service Discovery
                              │
                              ├── identity-service
                              ├── user-service
                              ├── mentor-service
                              ├── session-service
                              ├── wallet-service
                              ├── payment-service
                              ├── community-service
                              ├── communication-service
                              ├── review-service
                              └── admin-service
```

## Global Filters

| Filter | Order | Purpose |
|--------|-------|---------|
| CorrelationIdFilter | HIGHEST | Adds X-Correlation-ID header |
| JwtAuthFilter | HIGHEST+1 | (Future) JWT token validation |
| RequestLoggingFilter | LOWEST-1 | Logs request/response details |
| ResponseLoggingFilter | LOWEST | Logs error responses |
| GlobalErrorFilter | @Order(-1) | Consistent JSON error responses |

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Spring Cloud Gateway | Reactive API Gateway |
| Spring Cloud Config Client | Configuration from Config Server |
| Spring Cloud Netflix Eureka Client | Service registration and discovery |
| Spring Boot Actuator | Health checks and monitoring |
| Spring Boot Validation | Request validation |
| Common Library | Shared DTOs and utilities |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONFIG_SERVER_URL` | `http://localhost:8888` | Config Server URL |
| `API_GATEWAY_PORT` | `8080` | Server port |
| `EUREKA_DEFAULT_ZONE` | `http://localhost:8761/eureka/` | Eureka service URL |
| `EUREKA_PREFER_IP` | `true` | Prefer IP registration |
| `API_GATEWAY_LOG_DIR` | `logs` | Log directory |

## Routes

| Route | Target Service | Path |
|-------|---------------|------|
| identity-service | lb://identity-service | /api/v1/auth/** |
| user-service | lb://user-service | /api/v1/users/** |
| mentor-service | lb://mentor-service | /api/v1/mentors/** |
| session-service | lb://session-service | /api/v1/sessions/** |
| wallet-service | lb://wallet-service | /api/v1/wallet/** |
| payment-service | lb://payment-service | /api/v1/payments/** |
| community-service | lb://community-service | /api/v1/community/** |
| communication-service | lb://communication-service | /api/v1/communication/** |
| review-service | lb://review-service | /api/v1/reviews/** |
| admin-service | lb://admin-service | /api/v1/admin/** |

## Running Instructions

### Prerequisites

- Java 21, Maven 3.9+
- Config Server running on :8888
- Discovery Server running on :8761

### Build & Run

```bash
cd backend
mvn clean install -pl api-gateway -am
cd api-gateway
mvn spring-boot:run
```

## Actuator Endpoints

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Health check |
| `/actuator/info` | Application info |
| `/actuator/metrics` | Application metrics |
| `/actuator/gateway` | Gateway routes |

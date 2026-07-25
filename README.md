# Skill Infinity Platform

**Where Knowledge Creates Value.**

Skill Infinity is an enterprise-grade knowledge-sharing platform that connects learners and mentors through a credit-based ecosystem. Built with microservices architecture for scalability, maintainability, and production readiness.

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│   Frontend   │───▶│  API Gateway  │───▶│  Microservices   │
│  React + TS  │    │   :8080      │    │  (Identity,      │
└──────────────┘    └──────┬───────┘    │   User, Mentor,  │
                           │            │   Session, etc.)  │
                           ▼            └──────────────────┘
                    ┌──────────────┐
                    │   Config     │
                    │  Server:8888 │
                    └──────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Material UI, Axios, React Router |
| Backend | Java 21, Spring Boot 3.x, Spring Cloud, Maven |
| Database | MySQL 8 (per-service schemas) |
| Cache | Redis 7 |
| Message Broker | RabbitMQ |
| Object Storage | MinIO |
| Containerization | Docker & Docker Compose |

## Project Structure

```
skill-infinity-platform/
├── backend/
│   ├── common/              # Shared DTOs, exceptions, utilities
│   ├── config-server/       # Centralized configuration (Spring Cloud Config)
│   ├── discovery-server/    # Service discovery (Eureka)
│   ├── api-gateway/         # API Gateway (Spring Cloud Gateway)
│   ├── identity-service/    # Authentication & authorization
│   ├── user-service/        # User profiles & management
│   ├── mentor-service/      # Mentor profiles & expertise
│   ├── session-service/     # Session booking & scheduling
│   ├── wallet-service/      # Credit wallet & transactions
│   ├── payment-service/    # Payment processing
│   ├── community-service/   # Posts, comments, community features
│   ├── communication-service/ # Chat, notifications, email
│   ├── review-service/      # Ratings & reviews
│   ├── admin-service/       # Administration & analytics
│   └── pom.xml
├── frontend/                # React + TypeScript application
├── docker/                  # Docker Compose & database init
├── docs/                    # Documentation
├── .github/                 # CI/CD & issue templates
├── README.md
└── .gitignore
```

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+**
- **Docker & Docker Compose**

## Getting Started

### 1. Start Infrastructure

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Start Backend Services

```bash
# Start Config Server (port 8888)
cd backend/config-server && mvn spring-boot:run

# Start Discovery Server (port 8761)
cd backend/discovery-server && mvn spring-boot:run

# Start API Gateway (port 8080)
cd backend/api-gateway && mvn spring-boot:run
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Eureka Dashboard | http://localhost:8761 |
| Config Server | http://localhost:8888 |

## Build Commands

### Backend

```bash
cd backend
mvn clean install    # Build all modules
mvn clean compile    # Compile only
mvn clean test       # Run tests
```

### Frontend

```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

## API Documentation

Each service exposes OpenAPI documentation:

- **Swagger UI**: `/swagger-ui.html`
- **API Docs**: `/v3/api-docs`

## Microservices

### Core Infrastructure
| Service | Port | Description |
|---------|------|-------------|
| config-server | 8888 | Centralized configuration |
| discovery-server | 8761 | Service discovery (Eureka) |
| api-gateway | 8080 | API Gateway & routing |

### Business Services
| Service | Database Schema | Description |
|---------|----------------|-------------|
| identity-service | skill_infinity_identity | Auth, JWT, roles |
| user-service | skill_infinity_user | User profiles, skills |
| mentor-service | skill_infinity_mentor | Mentor profiles, availability |
| session-service | skill_infinity_session | Session booking & scheduling |
| wallet-service | skill_infinity_wallet | Credits & transactions |
| payment-service | skill_infinity_payment | Payment processing |
| community-service | skill_infinity_community | Posts, comments, likes |
| communication-service | skill_infinity_communication | Chat, notifications |
| review-service | skill_infinity_review | Ratings & reviews |
| admin-service | skill_infinity_admin | Admin dashboard & reports |

## Architecture Principles

- **Microservices**: Independent, loosely coupled, highly cohesive services
- **API-First**: RESTful APIs with consistent response format
- **Event-Driven**: Async communication via RabbitMQ for cross-service workflows
- **Database per Service**: Each service owns its database schema
- **Security**: JWT-based auth, RBAC, BCrypt encryption
- **Resilience**: Graceful error handling, logging, health checks

## License

[MIT License](LICENSE)

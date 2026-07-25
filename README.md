# Skill Infinity Platform

**Where Knowledge Creates Value.**

Skill Infinity is an enterprise-grade knowledge-sharing platform that connects learners and mentors through a credit-based ecosystem. Built with a true microservices architecture for scalability, maintainability, and production readiness.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│                    React + TypeScript                           │
│                     Material UI                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                      API Gateway  :8080                         │
│          Spring Cloud Gateway + Eureka Discovery Client         │
│    ┌────────────┬────────────┬────────────┬──────────────┐      │
│    │ Correlation│  Request   │  Response  │   JWT Auth   │      │
│    │   ID       │  Logging   │  Logging   │  (future)    │      │
│    └────────────┴────────────┴────────────┴──────────────┘      │
└──────┬──────────────────────────────────────────────────────────┘
       │ lb://service-name (via Eureka)
┌──────▼──────────────────────────────────────────────────────────┐
│                      Eureka Discovery Server  :8761             │
└──────┬──────────────────────────────────────────────────────────┘
       │ Configuration
┌──────▼──────────────────────────────────────────────────────────┐
│                      Config Server  :8888                       │
│          Spring Cloud Config (Git / Native backend)             │
└─────────────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                      Business Microservices                     │
│                                                                  │
│  ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Identity │ │  User  │ │  Mentor │ │  Session │ │  Wallet │  │
│  │ Service  │ │Service │ │ Service │ │ Service  │ │ Service │  │
│  └──────────┘ └────────┘ └─────────┘ └──────────┘ └─────────┘  │
│  ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Payment  │ │Community│ │Communic.│ │  Review  │ │  Admin  │  │
│  │ Service  │ │Service │ │ Service │ │ Service  │ │ Service │  │
│  └──────────┘ └────────┘ └─────────┘ └──────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│                                                                  │
│  MySQL(8)     Redis(7)     RabbitMQ     MinIO                    │
│  (per-svc)    (cache)      (events)     (storage)                │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Material UI 9, React Router 7, Axios 1 |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Cloud 2023.0.6, Maven |
| **Database** | MySQL 8.0 (per-service schemas) |
| **Cache** | Redis 7 |
| **Message Broker** | RabbitMQ 3 |
| **Object Storage** | MinIO |
| **Containerization** | Docker & Docker Compose |
| **API Documentation** | Springdoc OpenAPI |

## Repository Structure

```
skill-infinity/
├── backend/
│   ├── common/                 # Shared library (DTOs, exceptions, utils)
│   ├── config-server/          # Spring Cloud Config Server
│   ├── discovery-server/       # Eureka Service Registry
│   ├── api-gateway/            # Spring Cloud API Gateway
│   ├── identity-service/       # (placeholder)
│   ├── user-service/           # (placeholder)
│   ├── mentor-service/         # (placeholder)
│   ├── session-service/        # (placeholder)
│   ├── wallet-service/         # (placeholder)
│   ├── payment-service/        # (placeholder)
│   ├── community-service/      # (placeholder)
│   ├── communication-service/  # (placeholder)
│   ├── review-service/         # (placeholder)
│   ├── admin-service/          # (placeholder)
│   └── pom.xml
├── frontend/                   # React + TypeScript + Vite
├── docker/                     # Docker Compose & DB init
├── docs/                       # Documentation
├── scripts/                    # Development scripts
├── .github/                    # CI/CD & templates
├── .env.example                # Environment template
├── README.md
└── .gitignore
```

## Infrastructure Overview

| Service | Port | Description |
|---------|------|-------------|
| MySQL | 3306 | Primary database (per-service schemas) |
| Redis | 6379 | Cache & temporary data |
| RabbitMQ | 5672/15672 | Event broker / Management UI |
| MinIO | 9000/9001 | Object storage / Console |
| Config Server | 8888 | Centralized configuration |
| Discovery Server | 8761 | Eureka service registry |
| API Gateway | 8080 | Single entry point |
| Frontend | 80/5173 | React application |

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+**
- **Docker & Docker Compose**

## How to Start

### Quick Start (Docker Compose)

```bash
# Copy environment file
cp .env.example .env

# Start all infrastructure + application services
docker compose -f docker/docker-compose.yml up -d
```

### Development Mode

```bash
# Option 1: Use the startup script
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh

# Option 2: Start services individually

# 1. Infrastructure
docker compose -f docker/docker-compose.yml up -d mysql redis rabbitmq minio

# 2. Build backend
cd backend && mvn clean install -DskipTests

# 3. Start Config Server
cd config-server && mvn spring-boot:run

# 4. Start Discovery Server (after Config Server is ready)
cd discovery-server && mvn spring-boot:run

# 5. Start API Gateway (after Discovery Server is ready)
cd api-gateway && mvn spring-boot:run

# 6. Start Frontend
cd frontend && npm install && npm run dev
```

### How to Stop

```bash
# Docker services
docker compose -f docker/docker-compose.yml down

# Local processes
./scripts/stop-dev.sh
```

## Build Commands

### Backend

```bash
# Build all modules
cd backend && mvn clean install

# Build specific module with dependencies
mvn clean install -pl api-gateway -am

# Run tests for a module
mvn test -pl config-server

# Skip tests
mvn clean install -DskipTests
```

### Frontend

```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Development server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint code
```

## Environment Variables

See [.env.example](.env.example) for all configurable environment variables.

### Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONFIG_SERVER_URL` | `http://localhost:8888` | Config Server URL |
| `EUREKA_DEFAULT_ZONE` | `http://localhost:8761/eureka/` | Eureka service URL |
| `MYSQL_ROOT_PASSWORD` | *(required)* | MySQL root password |
| `REDIS_HOST` | `redis` | Redis hostname |
| `RABBITMQ_USER` | `guest` | RabbitMQ username |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Frontend API URL |

## Ports Used

| Port | Service |
|------|---------|
| 3306 | MySQL |
| 5173 | Frontend (dev) |
| 6379 | Redis |
| 5672 | RabbitMQ AMQP |
| 8080 | API Gateway |
| 8761 | Discovery Server (Eureka) |
| 8888 | Config Server |
| 9000 | MinIO API |
| 9001 | MinIO Console |
| 15672 | RabbitMQ Management |

## Microservices Architecture

### Infrastructure Services
- **Config Server** — Centralized configuration management (Git/native backend)
- **Discovery Server** — Eureka service registry with dashboard
- **API Gateway** — Single entry point with global filters, CORS, routing

### Shared Library
- **Common** — DTOs, exceptions, enums, validation, events, utilities

### Business Services (planned)
- **Identity** — Authentication, JWT, RBAC
- **User** — Profiles, skills, languages
- **Mentor** — Mentor profiles, expertise, availability
- **Session** — Booking, scheduling, history
- **Wallet** — Credits, transactions, rewards
- **Payment** — Credit purchase, refunds
- **Community** — Posts, comments, likes
- **Communication** — Chat, notifications, email
- **Review** — Ratings, feedback
- **Admin** — Dashboard, analytics, moderation

## Communication Patterns

- **Synchronous**: REST APIs through API Gateway → Eureka → Service
- **Asynchronous**: RabbitMQ events (future)
- **Service Discovery**: All services register with Eureka
- **Configuration**: All services fetch from Config Server

## API Documentation

Once running:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs
- **Eureka Dashboard**: http://localhost:8761

## Architecture Principles

| Principle | Application |
|-----------|-------------|
| **Microservices** | Independent, loosely coupled, highly cohesive services |
| **API-First** | RESTful APIs with consistent response format (ApiResponse wrapper) |
| **Event-Driven** | Async communication via RabbitMQ for cross-service workflows |
| **Database per Service** | Each service owns its database schema, no shared tables |
| **Security** | JWT-based auth, RBAC (ROLE_ADMIN, ROLE_MENTOR, ROLE_LEARNER), BCrypt |
| **Resilience** | Graceful error handling, structured logging, health checks |
| **Configuration** | Centralized via Config Server, never hardcoded |
| **Service Discovery** | Dynamic via Eureka, load-balanced communication |

## Day 1 Infrastructure Checklist

- [x] Repository structure with all modules
- [x] Parent POM with Java 21, Spring Boot 3.2.5, Spring Cloud 2023.0.6
- [x] Common Library (DTOs, exceptions, enums, validation, events, utilities)
- [x] Config Server (native + Git backend)
- [x] Discovery Server (Eureka with Config Server integration)
- [x] API Gateway (global filters, CORS, routing)
- [x] React Frontend (TypeScript, Material UI, Axios, Router)
- [x] Docker Compose (MySQL, Redis, RabbitMQ, MinIO, all app services)
- [x] Dockerfiles (multi-stage builds)
- [x] Documentation (API standards, architecture, setup)
- [x] GitHub templates (CI, PR, issues, CODEOWNERS)
- [x] Development scripts

## License

[MIT License](LICENSE)

# Skill Infinity Platform

**Where Knowledge Creates Value.**

Skill Infinity is an enterprise-grade knowledge-sharing platform that connects learners and mentors through a credit-based ecosystem. Built on a microservices architecture for scalability, maintainability, and production readiness, it ships with three complete portals — **Learner**, **Mentor**, and **Admin** — plus a full marketplace, wallet/credit system, and Razorpay-powered payments.

## Features

| Area | Highlights |
|------|-----------|
| **Learner portal** | Dashboard, profile (education, experience, skills, languages, social, resume), session booking, calendar, meetings |
| **Mentor portal** | Mentor application flow, availability & pricing, analytics, certificates, achievements, settings |
| **Admin portal** | Dashboard & analytics, users, mentors, sessions, payments, withdrawals, reviews, support, announcements, reports, feature flags, audit logs, monitoring |
| **Marketplace** | Browse/search mentors, mentor profiles with ratings, book & manage sessions |
| **Wallet & credits** | Credit-based payments, transactions, subscriptions, mentor payouts |
| **Payments** | Razorpay integration (test mode) with webhooks — key ID only exposed to the client |
| **Reviews** | Ratings, reviews, rating breakdown & statistics per mentor (hosted by session-service) |
| **Community sessions** | Free/community sessions per learner per month (configurable allowance), joined via real Discord invite links |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│                React 19 + TypeScript + Vite 8                   │
│                 Material UI 9, Redux Toolkit                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                      API Gateway  :8080                         │
│      Spring Cloud Gateway + JWT auth + rate limiting + CORS     │
└──────┬──────────────────────────────────────────────────────────┘
       │ lb://service-name (via Eureka)
┌──────▼──────────────────────────────────────────────────────────┐
│                      Eureka Discovery Server  :8761             │
└──────┬──────────────────────────────────────────────────────────┘
       │ Configuration
┌──────▼──────────────────────────────────────────────────────────┐
│                      Config Server  :8888                       │
│                Spring Cloud Config (Native backend)             │
└─────────────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                      Business Microservices                     │
│                                                                  │
│  ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Identity │ │  User  │ │  Mentor │ │  Session │ │  Wallet │  │
│  │ Service  │ │Service │ │ Service │ │ Service  │ │ Service │  │
│  │  :8081   │ │ :8082  │ │  :8083  │ │  :8084   │ │  :8085  │  │
│  └──────────┘ └────────┘ └─────────┘ └──────────┘ └─────────┘  │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐                       │
│  │ Payment  │ │   Admin   │ │  Reviews  │                       │
│  │ Service  │ │  Service  │ │ (hosted by│                       │
│  │  :8086   │ │   :8090   │ │  session) │                       │
│  └──────────┘ └───────────┘ └───────────┘                       │
└─────────────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│                                                                  │
│  MySQL(8)      RabbitMQ       Razorpay      Discord (meetings)   │
│  (per-svc)      (events)      (payments)    (invite links)       │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript (strict), Vite 8, Material UI 9, Redux Toolkit + Redux Persist, TanStack Query, React Hook Form + Zod, Axios, React Router, Framer Motion |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Cloud 2023.0.6, Maven |
| **Database** | MySQL 8.0 (per-service schemas) |
| **Message Broker** | RabbitMQ 3 (async events between services) |
| **Payments** | Razorpay (test mode, webhooks) |
| **Meetings** | Discord invite links (no WebRTC / video infra) |
| **Containerization** | Docker & Docker Compose |
| **API Documentation** | Springdoc OpenAPI |
| **Quality** | JaCoCo, SpotBugs, PMD, Checkstyle, ArchUnit, Testcontainers, Oxlint, Prettier, Vitest |

## Repository Structure

```
skill-infinity/
├── backend/
│   ├── common/                 # Shared library (DTOs, exceptions, utils, events)
│   ├── config-server/          # Spring Cloud Config Server (:8888)
│   ├── discovery-server/       # Eureka Service Registry (:8761)
│   ├── api-gateway/            # Spring Cloud API Gateway (:8080)
│   ├── identity-service/       # Auth, JWT, RBAC (:8081)
│   ├── user-service/           # User profiles, skills, languages (:8082)
│   ├── mentor-service/         # Mentor profiles, availability, pricing (:8083)
│   ├── session-service/        # Booking, scheduling, reviews, community sessions (:8084)
│   ├── wallet-service/         # Credits, transactions, rewards (:8085)
│   ├── payment-service/        # Razorpay credit purchases, refunds (:8086)
│   ├── admin-service/          # Admin dashboard, analytics, moderation (:8090)
│   └── pom.xml
├── frontend/                   # React + TypeScript + Vite (:3000)
│   └── src/
│       ├── pages/              # learner/, mentor/, admin/ portals + shared pages
│       ├── features/           # Feature-first modules (auth, sessions, wallet, ...)
│       ├── services/           # Domain API services
│       └── ...                 # api, components, guards, layouts, routes, store, theme
├── docker/                     # Docker Compose, DB init, RabbitMQ config
├── docs/                       # Architecture, setup, deployment, API standards
├── scripts/                    # Dev / run-all / stop scripts
├── .github/                    # CI workflow & templates
├── .env.example                # Environment template
├── README.md
└── .gitignore
```

## Infrastructure Overview

| Service | Port | Description |
|---------|------|-------------|
| MySQL | 3306 | Primary database (per-service schemas) |
| RabbitMQ | 5672/15672 | Event broker / Management UI |
| Config Server | 8888 | Centralized configuration |
| Discovery Server | 8761 | Eureka service registry |
| API Gateway | 8080 | Single entry point (JWT, rate limiting, CORS) |
| Identity Service | 8081 | Auth, JWT, roles |
| User Service | 8082 | User profiles |
| Mentor Service | 8083 | Mentor profiles & bookings logic |
| Session Service | 8084 | Sessions, reviews, community sessions |
| Wallet Service | 8085 | Credits & transactions |
| Payment Service | 8086 | Razorpay payments |
| Admin Service | 8090 | Admin & moderation |
| Frontend (dev) | 3000 | React application (Vite) |

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+**
- **Docker & Docker Compose**

## Quick Start

### 1. Configure environment

```bash
cp .env.example .env
```

Fill in at minimum `MYSQL_ROOT_PASSWORD` and `JWT_SECRET` (the example ships with working defaults). Add your Razorpay test keys and a Discord invite URL to enable credit purchases and session meeting links.

### 2. Start the platform

**Option A — everything in Docker (backend + infrastructure):**

```bash
docker compose -f docker/docker-compose.yml up -d
```

The frontend intentionally runs outside Docker (see below) so its dev server doesn't compete with the backend JVMs for resources.

**Option B — local JVMs from prebuilt jars (fast, no rebuilds):**

```bash
cd backend && mvn clean install -DskipTests && cd ..
./scripts/run-all.sh            # backend only
./scripts/run-all.sh --frontend # backend + frontend
```

**Option C — full dev mode (infra in Docker, backend via Maven, frontend via Vite):**

```bash
./scripts/start-dev.sh
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000 (proxies /api → gateway :8080)
```

### How to Stop

```bash
# Docker services
docker compose -f docker/docker-compose.yml down

# Local JVM processes
./scripts/stop-all.sh

# Dev-mode processes
./scripts/stop-dev.sh
```

## Build Commands

### Backend

```bash
cd backend
mvn clean install               # Build all modules (with tests)
mvn clean install -DskipTests   # Build all modules (skip tests)
mvn test -pl config-server      # Run tests for a specific module
mvn clean install -pl api-gateway -am  # Build one module + its dependencies
```

### Frontend

```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Development server (port 3000)
npm run build      # Type-check + production build
npm run preview    # Preview production build
npm run lint       # Oxlint
npm run test       # Vitest (single run)
npm run typecheck  # tsc -b
npm run format     # Prettier
```

## Environment Variables

See [.env.example](.env.example) for all configurable environment variables.

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | *(required)* | MySQL root password (used by all services) |
| `JWT_SECRET` | *(required)* | JWT signing key shared by identity-service & gateway |
| `JWT_ACCESS_EXPIRY` | `28800000` (8h) | Access token lifetime (ms) |
| `JWT_REFRESH_EXPIRY` | `604800000` (7d) | Refresh token lifetime (ms) |
| `RABBITMQ_USER` / `RABBITMQ_PASSWORD` | `guest` / `guest` | RabbitMQ credentials |
| `CONFIG_SERVER_PORT` | `8888` | Config Server port |
| `DISCOVERY_SERVER_PORT` | `8761` | Eureka port |
| `EUREKA_DEFAULT_ZONE` | `http://discovery-server:8761/eureka/` | Eureka URL |
| `API_GATEWAY_PORT` | `8080` | API Gateway port |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | *(blank)* | Razorpay test keys (required for credit purchases) |
| `RAZORPAY_WEBHOOK_SECRET` | *(blank)* | Razorpay webhook signature secret |
| `COMMUNITY_ALLOWANCE_PER_MONTH` | `5` | Free/community sessions per learner per month |
| `JOIN_WINDOW_MINUTES` | `10` | Minutes before start until end during which a session can be joined |
| `DISCORD_MEETING_URL` | *(blank)* | Real Discord invite URL used as the meeting link for sessions |
| `DISCORD_INVITE_CODE` | *(blank)* | Legacy alias — real invite code (used when URL is blank) |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Frontend API base URL |

## Ports Used

| Port | Service |
|------|---------|
| 3306 | MySQL |
| 3000 | Frontend (Vite dev) |
| 5672 | RabbitMQ AMQP |
| 8080 | API Gateway |
| 8081–8086 | Identity, User, Mentor, Session, Wallet, Payment |
| 8090 | Admin Service |
| 8761 | Discovery Server (Eureka) |
| 8888 | Config Server |
| 15672 | RabbitMQ Management |

## Microservices

### Infrastructure Services
- **Config Server** (`:8888`) — Centralized configuration (native backend)
- **Discovery Server** (`:8761`) — Eureka service registry with dashboard
- **API Gateway** (`:8080`) — Single entry point with JWT auth, rate limiting, request validation, CORS, and load-balanced routing

### Business Services
- **Identity** (`:8081`) — Register/login, JWT access + refresh tokens, email verification, forgot/reset password, RBAC (ROLE_LEARNER, ROLE_MENTOR, ROLE_ADMIN), BCrypt
- **User** (`:8082`) — User profiles, education, experience, skills, languages, social links, resume
- **Mentor** (`:8083`) — Mentor applications, profiles, expertise, availability, pricing, analytics, certificates, achievements
- **Session** (`:8084`) — Booking & scheduling, session history, join window, community (free) session allowance, reviews & ratings, Discord meeting links
- **Wallet** (`:8085`) — Credit balance, transactions, credit freeze/release on bookings, rewards
- **Payment** (`:8086`) — Razorpay order creation, webhook verification, credit top-ups, refunds
- **Admin** (`:8090`) — Dashboards, user/mentor/session/payment moderation, withdrawals, support, announcements, feature flags, audit logs

### Shared Library
- **Common** — DTOs, exceptions, enums, validation, events, utilities shared across services

## Communication Patterns

- **Synchronous**: REST through API Gateway → Eureka → service (load-balanced via `lb://`)
- **Asynchronous**: RabbitMQ events for cross-service workflows (booking, payments, notifications)
- **Service Discovery**: All services register with Eureka
- **Configuration**: All services fetch from Config Server
- **Security**: JWT verified at the gateway; services trust authenticated requests

## API Documentation

Once running, each service exposes its own OpenAPI UI:
- **Identity**: http://localhost:8081/swagger-ui.html
- **User**: http://localhost:8082/swagger-ui.html
- **Mentor**: http://localhost:8083/swagger-ui.html
- **Session**: http://localhost:8084/swagger-ui.html
- **Wallet**: http://localhost:8085/swagger-ui.html
- **Payment**: http://localhost:8086/swagger-ui.html
- **Admin**: http://localhost:8090/swagger-ui.html
- **Eureka Dashboard**: http://localhost:8761

## Architecture Principles

| Principle | Application |
|-----------|-------------|
| **Microservices** | Independent, loosely coupled, highly cohesive services |
| **API-First** | RESTful APIs with consistent `ApiResponse` wrapper |
| **Event-Driven** | Async communication via RabbitMQ for cross-service workflows |
| **Database per Service** | Each service owns its database schema, no shared tables |
| **Security** | JWT-based auth, RBAC (ROLE_ADMIN, ROLE_MENTOR, ROLE_LEARNER), BCrypt |
| **Resilience** | Graceful error handling, structured logging, readiness health checks, rate limiting |
| **Configuration** | Centralized via Config Server, never hardcoded |
| **Service Discovery** | Dynamic via Eureka, load-balanced communication |

## Quality & Testing

- **Backend**: JUnit, Testcontainers, ArchUnit, JaCoCo coverage, SpotBugs, PMD, Checkstyle
- **Frontend**: Vitest + Testing Library (jsdom), Oxlint, Prettier
- **CI**: GitHub Actions workflow (`.github/workflows/ci.yml`)
- See [docs/](docs/) for architecture, setup, deployment, API standards, security, and testing guides.

## License

[MIT License](LICENSE)

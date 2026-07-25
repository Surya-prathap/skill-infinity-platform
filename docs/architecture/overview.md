# Skill Infinity - Architecture Overview

## System Architecture

Skill Infinity follows a **Microservices Architecture** with the following key characteristics:

- **Independent Services**: Each microservice is independently deployable, scalable, and testable.
- **Event-Driven Communication**: Services communicate asynchronously via RabbitMQ for eventual consistency.
- **API Gateway**: All client requests route through a single API Gateway entry point.
- **Service Discovery**: Eureka server manages dynamic service registration and discovery.
- **Centralized Configuration**: Spring Cloud Config Server manages all service configurations.

## Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│ API Gateway │────▶│  Discovery  │
│  (React)    │     │   :8080     │     │  :8761      │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐    ┌──────────────────┐
                    │  Config      │    │  Microservices   │
                    │  Server:8888 │    │  (Identity,      │
                    └──────────────┘    │   User, Mentor,  │
                                        │   Session, etc.) │
                                        └──────────────────┘
```

## Technology Stack

- **Frontend**: React + TypeScript + Material UI
- **Backend**: Java 21, Spring Boot 3.x, Spring Cloud
- **Database**: MySQL (per-service schemas)
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Object Storage**: MinIO
- **Containerization**: Docker + Docker Compose

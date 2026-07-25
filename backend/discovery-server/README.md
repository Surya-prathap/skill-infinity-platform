# Skill Infinity - Discovery Server

## Purpose

The Discovery Server (Eureka) is the service registry for the Skill Infinity platform. All microservices register themselves with this server at startup, enabling service discovery and load-balanced communication.

## Responsibilities

- Service registration and discovery
- Health monitoring of registered services
- Eureka Dashboard for visualizing registered services
- Load balancing support for inter-service communication

## Architecture

The Discovery Server retrieves its configuration from the Config Server. All settings except bootstrap configuration are centralized.

```
Config Server :8888
       │
       ▼
Discovery Server :8761
       │
       ├── api-gateway :8080
       ├── identity-service (future)
       ├── user-service (future)
       └── ... (all future microservices)
```

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Spring Cloud Config Client | Fetch configuration from Config Server |
| Spring Cloud Netflix Eureka Server | Service registry implementation |
| Spring Boot Actuator | Health checks and monitoring |
| Spring Boot Validation | Request validation |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONFIG_SERVER_URL` | `http://localhost:8888` | Config Server URL |
| `CONFIG_SERVER_FAIL_FAST` | `false` | Fail fast if Config Server unavailable |
| `DISCOVERY_SERVER_PORT` | `8761` | Server port |
| `EUREKA_HOSTNAME` | `localhost` | Eureka server hostname |
| `EUREKA_PREFER_IP` | `true` | Prefer IP address registration |
| `EUREKA_DEFAULT_ZONE` | `http://localhost:8761/eureka/` | Default service URL |
| `EUREKA_WAIT_TIME` | `0` | Wait time for empty sync |
| `EUREKA_SELF_PRESERVATION` | `false` | Enable self-preservation mode |
| `EUREKA_EVICTION_INTERVAL` | `5000` | Eviction interval in ms |
| `DISCOVERY_SERVER_LOG_DIR` | `logs` | Log directory |

## Running Instructions

### Prerequisites

- Java 21
- Maven 3.9+
- Config Server must be running

### Build

```bash
cd backend
mvn clean install -pl discovery-server -am
```

### Start

```bash
# Start Config Server first (in another terminal)
cd backend/config-server && mvn spring-boot:run

# Start Discovery Server
cd backend/discovery-server && mvn spring-boot:run
```

### Access

| Endpoint | URL |
|----------|-----|
| Eureka Dashboard | http://localhost:8761 |
| Health Check | http://localhost:8761/actuator/health |
| Application Info | http://localhost:8761/actuator/info |
| Metrics | http://localhost:8761/actuator/metrics |

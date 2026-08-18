# Skill Infinity - Config Server

## Purpose

The Config Server is the centralized configuration management service for the Skill Infinity platform. It provides externalized configuration for all microservices, enabling them to share common settings while maintaining service-specific properties.

## Responsibilities

- Centralized configuration management for all microservices
- Serving configuration properties via REST API
- Supporting Git-backed and native (classpath) configuration sources
- Providing encrypted property values for sensitive data
- Exposing health checks and monitoring endpoints

## Dependencies

| Dependency                | Purpose                                         |
|---------------------------|-------------------------------------------------|
| Spring Cloud Config Server | Configuration server implementation             |
| Spring Boot Actuator      | Health checks, metrics, and monitoring          |
| Spring Boot Validation    | Request validation                              |
| Lombok                    | Boilerplate code reduction                      |

## Configuration

### Default Profile (native)

By default, the Config Server loads configuration from the classpath (`classpath:/config/`). This is suitable for local development and testing. Configuration files are located at:

```
src/main/resources/config/
```

These include settings for all platform services:
- `identity-service.yml`
- `user-service.yml`
- `mentor-service.yml`
- `session-service.yml` (hosts sessions and reviews)
- `wallet-service.yml`
- `payment-service.yml`
- `admin-service.yml`

### Git Profile (production)

For production, activate the `git` profile:

```bash
--spring.profiles.active=git
```

This configures the Config Server to read from a Git repository. The repository URL and credentials are configurable via environment variables (see below).

## Environment Variables

| Variable                        | Default                | Description                                    |
|---------------------------------|------------------------|------------------------------------------------|
| `CONFIG_SERVER_PORT`            | `8888`                 | Server port                                    |
| `CONFIG_REPO_URI`               | *(none)*               | Git repository URL (required for git profile)  |
| `CONFIG_REPO_DEFAULT_BRANCH`    | `main`                 | Default branch to read configuration from      |
| `CONFIG_REPO_CLONE_ON_START`    | `true`                 | Clone repository on startup                    |
| `CONFIG_REPO_FORCE_PULL`        | `true`                 | Force pull latest changes                      |
| `CONFIG_REPO_TIMEOUT`           | `10`                   | Connection timeout in seconds                  |
| `CONFIG_REPO_BASEDIR`           | temp directory         | Local checkout directory                       |
| `CONFIG_REPO_USERNAME`          | *(none)*               | Git username (for private repos)               |
| `CONFIG_REPO_PASSWORD`          | *(none)*               | Git password or token (for private repos)      |
| `CONFIG_SERVER_LOG_DIR`        | `logs`                 | Log file directory                             |

## Running Instructions

### Prerequisites

- Java 21
- Maven 3.9+

### Build

```bash
cd backend
mvn clean install -pl config-server -am
```

### Run (Native Profile - Local Development)

```bash
cd backend/config-server
mvn spring-boot:run
```

### Run (Git Profile - Production)

```bash
cd backend/config-server
CONFIG_REPO_URI=https://github.com/your-org/config-repo.git \
  mvn spring-boot:run -Dspring-boot.run.profiles=git
```

### Run as JAR

```bash
java -jar target/config-server-1.0.0-SNAPSHOT.jar
```

With Git profile:

```bash
java -jar target/config-server-1.0.0-SNAPSHOT.jar \
  --spring.profiles.active=git \
  --spring.cloud.config.server.git.uri=https://github.com/your-org/config-repo.git
```

## Actuator Endpoints

| Endpoint                     | Description                          |
|------------------------------|--------------------------------------|
| `/actuator/health`           | Health check with detailed status    |
| `/actuator/info`             | Application information              |
| `/actuator/metrics`          | Application metrics                  |
| `/actuator/prometheus`       | Prometheus metrics (if enabled)      |

## API Endpoints

The Config Server exposes configuration endpoints for client services:

| Endpoint                                               | Description                                  |
|--------------------------------------------------------|----------------------------------------------|
| `/{application}/{profile}`                             | Configuration for application and profile    |
| `/{application}/{profile}/{label}`                     | Configuration with specific label/branch     |
| `/{application}-{profile}.yml`                         | Configuration in YAML format                 |
| `/{application}-{profile}.properties`                  | Configuration in Properties format           |

## Security

Authentication is currently **disabled** for local development. The Config Server includes a `secure` profile placeholder for future Spring Security integration. Enable it with:

```bash
--spring.profiles.active=secure
```

## Testing

Run tests:

```bash
cd backend
mvn test -pl config-server
```

Tests include:
- Application context loading verification
- Environment property validation
- Bean registration verification
- Configuration profile validation

# Skill Infinity - Development Setup

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+**
- **Docker & Docker Compose**
- **IDE**: IntelliJ IDEA (recommended) or VS Code

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd skill-infinity-platform
```

### 2. Start Infrastructure Services

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts MySQL, Redis, RabbitMQ, and MinIO.

### 3. Start Backend Services

Start services in this order:

```bash
# Start Config Server
cd backend/config-server
mvn spring-boot:run

# Start Discovery Server
cd backend/discovery-server
mvn spring-boot:run

# Start API Gateway
cd backend/api-gateway
mvn spring-boot:run
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Eureka Dashboard**: http://localhost:8761
- **Config Server**: http://localhost:8888

## Build Commands

### Backend

```bash
cd backend
mvn clean install          # Build all modules
mvn clean compile          # Compile all modules
mvn clean test             # Run all tests
```

### Frontend

```bash
cd frontend
npm run dev                # Start dev server
npm run build              # Production build
npm run preview            # Preview production build
```

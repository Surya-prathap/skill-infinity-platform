#!/bin/bash
# ============================================================
# Skill Infinity - Development Startup Script
# ============================================================
set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Skill Infinity - Starting Development           ║"
echo "╚══════════════════════════════════════════════════════════╝"

# 1. Start infrastructure services
echo ""
echo "▶ Starting infrastructure services (MySQL, Redis, RabbitMQ, MinIO)..."
docker compose -f docker/docker-compose.yml up -d mysql redis rabbitmq minio
echo "   Waiting for databases to be ready..."
sleep 10

# 2. Build backend modules (skip tests for speed)
echo ""
echo "▶ Building backend modules..."
cd backend
mvn clean install -DskipTests -q
echo "   Backend build complete."

# 3. Start Config Server
echo ""
echo "▶ Starting Config Server (port 8888)..."
cd config-server
mvn spring-boot:run -q &
CONFIG_PID=$!
cd ..
sleep 15

# 4. Start Discovery Server
echo ""
echo "▶ Starting Discovery Server (port 8761)..."
cd discovery-server
mvn spring-boot:run -q &
DISCOVERY_PID=$!
cd ..
sleep 10

# 5. Start API Gateway
echo ""
echo "▶ Starting API Gateway (port 8080)..."
cd api-gateway
mvn spring-boot:run -q &
GATEWAY_PID=$!
cd ..
cd ..

# 6. Start Frontend
echo ""
echo "▶ Starting Frontend (port 5173)..."
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         All services starting!                          ║"
echo "║                                                         ║"
echo "║   Frontend:       http://localhost:5173                 ║"
echo "║   API Gateway:    http://localhost:8080                 ║"
echo "║   Eureka:         http://localhost:8761                 ║"
echo "║   Config Server:  http://localhost:8888                 ║"
echo "║   RabbitMQ:       http://localhost:15672                ║"
echo "║   MinIO Console:  http://localhost:9001                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C and stop all services
trap "echo 'Stopping...'; kill $CONFIG_PID $DISCOVERY_PID $GATEWAY_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for any background process to finish
wait

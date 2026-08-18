# Deployment Guide

## Overview

This guide covers production deployment of the Skill Infinity Platform across all microservices.

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Docker & Docker Compose v2.20+**
- **Kubernetes** (for cloud deployment)
- **Helm** (for Kubernetes package management)
- **Node.js 20+** (for frontend build)

## Infrastructure Requirements

### Production Minimum Specifications

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| MySQL 8.0 | 4 cores | 8GB RAM | 100GB SSD |
| RabbitMQ 3 | 2 cores | 4GB RAM | 20GB SSD |
| Each Microservice | 1-2 cores | 2-4GB RAM | 10GB SSD |
| API Gateway | 2 cores | 4GB RAM | 10GB SSD |
| Config Server | 1 core | 2GB RAM | 10GB SSD |
| Discovery Server | 1 core | 2GB RAM | 10GB SSD |

### Networking

| Port | Service | Protocol |
|------|---------|----------|
| 80/443 | Frontend (Nginx) | HTTP/HTTPS |
| 8080 | API Gateway | HTTP |
| 8761 | Discovery Server | HTTP |
| 8888 | Config Server | HTTP |
| 3306 | MySQL | TCP |
| 5672 | RabbitMQ AMQP | TCP |
| 15672 | RabbitMQ Management | HTTP |

## Docker Deployment

### Environment Variables

```bash
# Required - must be set before deployment
export MYSQL_ROOT_PASSWORD=<strong-password>
export JWT_SECRET=<256-bit-hex-secret>
export CONFIG_REPO_URI=<git-repo-url>  # optional, for Git backend

# Optional with defaults
export RABBITMQ_USER=guest
export RABBITMQ_PASSWORD=<rabbitmq-password>
```

### Deploy with Docker Compose

```bash
# Copy environment template
cp .env.example .env
# Edit .env with production values
nano .env

# Build and start all services
docker compose -f docker/docker-compose.yml up -d --build

# Verify deployment
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f
```

### Health Check Verification

```bash
# Check all health endpoints
./scripts/health-check.sh
```

### Scaling Services

```bash
# Scale specific services
docker compose -f docker/docker-compose.yml up -d --scale session-service=3 --scale mentor-service=3
```

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'skill-infinity'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
        - 'api-gateway:8080'
        - 'identity-service:8081'
        - 'user-service:8082'
        - 'mentor-service:8083'
        - 'session-service:8084'
        - 'wallet-service:8085'
        - 'payment-service:8086'
        - 'review-service:8089'
        - 'admin-service:8090'
```

### Grafana Dashboards

Import pre-built dashboards:
- JVM Micrometer Dashboard (ID: 4701)
- Spring Boot Statistics (ID: 10280)
- Business Metrics Dashboard (custom)

## Security Checklist

- [ ] JWT secret rotated quarterly
- [ ] All passwords in environment variables
- [ ] SSL/TLS enabled for all endpoints
- [ ] Database access restricted to service IPs
- [ ] API Gateway rate limiting enabled
- [ ] Audit logging configured
- [ ] Security headers enabled
- [ ] CORS restricted to known origins
- [ ] RabbitMQ admin interface secured
- [ ] Regular security updates applied

## Troubleshooting

### Common Issues

1. **Service fails to start**: Check Config Server is healthy first
2. **Database connection refused**: Verify MySQL is running and credentials are correct
4. **RabbitMQ connection failed**: Verify RabbitMQ credentials and virtual host
5. **Eureka registration failed**: Check Discovery Server URL and network connectivity

### Logs

```bash
# View all service logs
docker compose -f docker/docker-compose.yml logs -f

# View specific service logs
docker compose -f docker/docker-compose.yml logs -f api-gateway

# View last 100 lines with timestamps
docker compose -f docker/docker-compose.yml logs --tail=100 -t api-gateway
```

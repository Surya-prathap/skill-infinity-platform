#!/bin/bash
# ============================================================
# Skill Infinity - Run ALL services (fast & memory-tuned)
# ------------------------------------------------------------
# Starts the 11 backend microservices from PREBUILT jars using
# `java -jar` (no Maven/docker rebuilds => much faster startup)
# with per-service heap limits so the whole platform fits in 8 GB.
#
# Usage:
#   ./scripts/run-all.sh            # backend only
#   ./scripts/run-all.sh --frontend # backend + frontend (vite)
#   ./scripts/stop-all.sh           # stop everything
# ============================================================
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JAVA_BIN="${JAVA_HOME_21:-/c/Program Files/Java/jdk-21/bin/java}"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

# Load infra credentials from .env (passwords, JWT secret)
set -a
# shellcheck disable=SC1091
source "$ROOT/.env"
set +a

# ------------------------------------------------------------
# Local (non-Docker) runtime overrides
# ------------------------------------------------------------
export CONFIG_SERVER_URL="http://localhost:8888"
export EUREKA_DEFAULT_ZONE="http://localhost:8761/eureka/"
export EUREKA_HOSTNAME="localhost"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export RABBITMQ_HOST="localhost"
export RABBITMQ_AMQP_PORT="5672"
export RABBITMQ_PORT="5672"
export RABBITMQ_USER="${RABBITMQ_USER:-guest}"
export RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-guest}"

# MySQL credentials come from .env so they match the running container
export MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD missing in .env}"

# Shared JVM tuning: G1GC, fast startup (C1-only JIT), compact heap
# -XX:TieredStopAtLevel=1   => ~30% faster Spring Boot startup, ideal for I/O-bound dev services
# -XX:MaxMetaspaceSize=192m => caps the (large) metaspace each Spring Boot app allocates so the
#                              11 JVMs + Docker infra fit in the 8 GB dev machine without swap thrash.
#                              NOTE: if a service ever dies at startup with OutOfMemoryError: Metaspace,
#                              raise this cap (it is the first knob to tune).
COMMON_OPTS="-XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -XX:MaxMetaspaceSize=192m -XX:ReservedCodeCacheSize=64m -Xss512k -Djava.security.egd=file:/dev/./urandom -Dfile.encoding=UTF-8 -Dnetworkaddress.cache.ttl=60 -Dnetworkaddress.cache.negative.ttl=10"

# service_name|jar_path|heap|-Xms|extra_env
SERVICES=(
  "config-server|config-server/target/config-server-1.0.0-SNAPSHOT.jar|192m|64m|SPRING_PROFILES_ACTIVE=native"
  "discovery-server|discovery-server/target/discovery-server-1.0.0-SNAPSHOT.jar|192m|64m|"
  "api-gateway|api-gateway/target/api-gateway-1.0.0-SNAPSHOT.jar|192m|96m|JWT_SECRET=$JWT_SECRET"
  "identity-service|identity-service/target/identity-service-1.0.0-SNAPSHOT.jar|256m|96m|JWT_SECRET=$JWT_SECRET IDENTITY_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
  "user-service|user-service/target/user-service-1.0.0-SNAPSHOT.jar|256m|96m|USER_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
  "mentor-service|mentor-service/target/mentor-service-1.0.0-SNAPSHOT.jar|256m|96m|MENTOR_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
  "session-service|session-service/target/session-service-1.0.0-SNAPSHOT.jar|256m|96m|SESSION_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
  "wallet-service|wallet-service/target/wallet-service-1.0.0-SNAPSHOT.jar|256m|96m|WALLET_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
  "payment-service|payment-service/target/payment-service-1.0.0-SNAPSHOT.jar|256m|96m|PAYMENT_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
  "admin-service|admin-service/target/admin-service-1.0.0-SNAPSHOT.jar|256m|96m|ADMIN_DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
)

start_service() {
  local name="$1" jar="$2" xmx="$3" xms="$4" extra="$5"
  local jar_path="$ROOT/backend/$jar"
  local log="$LOG_DIR/$name.log"

  if [ ! -f "$jar_path" ]; then
    echo "✗ $name: jar not found at $jar_path (run: cd backend && mvn install -DskipTests)"
    return 1
  fi
  echo "▶ $name (heap ${xmx})"
  # shellcheck disable=SC2086
  env $extra nohup "$JAVA_BIN" $COMMON_OPTS -Xms$xms -Xmx$xmx -jar "$jar_path" >> "$log" 2>&1 &
}

# ------------------------------------------------------------
# 1. Config server must be up first (all other services import config)
# ------------------------------------------------------------
echo "════════════════════════════════════════════════════════"
echo "  Skill Infinity - starting backend services"
echo "════════════════════════════════════════════════════════"
# first service (config-server) — heap fields parsed from the entry
IFS='|' read -r name jar xmx xms extra <<< "${SERVICES[0]}"
start_service "$name" "$jar" "$xmx" "$xms" "$extra"

echo "   Waiting for config-server (8888)..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null --max-time 2 "http://localhost:8888/actuator/health" 2>/dev/null; then
    echo "   config-server UP after ${i}s"
    break
  fi
  sleep 1
  [ "$i" -eq 60 ] && { echo "✗ config-server failed to start - see $LOG_DIR/config-server.log"; exit 1; }
done

# ------------------------------------------------------------
# 2. Discovery server (needs config server)
# ------------------------------------------------------------
IFS='|' read -r name jar xmx xms extra <<< "${SERVICES[1]}"
start_service "$name" "$jar" "$xmx" "$xms" "$extra"
echo "   Waiting for discovery-server (8761)..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null --max-time 2 "http://localhost:8761/actuator/health" 2>/dev/null; then
    echo "   discovery-server UP after ${i}s"
    break
  fi
  sleep 1
  [ "$i" -eq 60 ] && { echo "✗ discovery-server failed - see $LOG_DIR/discovery-server.log"; exit 1; }
done

# ------------------------------------------------------------
# 3. Remaining services in TWO staggered waves (config+discovery ready)
#    Wave 1 = SERVICES[2..6] (gateway + 4 core services), wave 2 = the rest.
#    Starting 9 JVMs at once peaks CPU/disk/memory (and Windows Defender
#    scanning of fat jars) and thrashes the page file on 8 GB dev machines,
#    which is what made every service take 80-150 s to start. Two waves keep
#    the cold-start load low. Index-based slicing: any service later appended
#    to the SERVICES array is picked up automatically.
# ------------------------------------------------------------
echo "   Starting wave 1 (core services)..."
for entry in "${SERVICES[@]:2:5}"; do
  IFS='|' read -r name jar xmx xms extra <<< "$entry"
  start_service "$name" "$jar" "$xmx" "$xms" "$extra"
done
echo "   Pausing 12s before wave 2 (spreads peak CPU/disk/memory load)..."
sleep 12
echo "   Starting wave 2..."
for entry in "${SERVICES[@]:7}"; do
  IFS='|' read -r name jar xmx xms extra <<< "$entry"
  start_service "$name" "$jar" "$xmx" "$xms" "$extra"
done

# ------------------------------------------------------------
# 4. Wait for all services to be healthy
# ------------------------------------------------------------
PORTS=(8080 8081 8082 8083 8084 8085 8086 8090)
echo "   Waiting for all services to become healthy..."
ALL_UP=0
for i in $(seq 1 120); do
  ALL_UP=1
  for p in "${PORTS[@]}"; do
    if ! curl -s -o /dev/null --max-time 2 "http://localhost:$p/actuator/health" 2>/dev/null; then
      ALL_UP=0
      break
    fi
  done
  if [ "$ALL_UP" -eq 1 ]; then
    echo "   ✓ All services UP after ${i}s"
    break
  fi
  sleep 1
done

# ------------------------------------------------------------
# 5. Optional: frontend
# ------------------------------------------------------------
FRONTEND_PID=""
if [ "${1:-}" = "--frontend" ]; then
  echo "▶ Starting frontend (vite :3000)..."
  (cd "$ROOT/frontend" && nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 & echo $! > "$LOG_DIR/frontend.pid")
  FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid" 2>/dev/null || true)
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Status"
echo "════════════════════════════════════════════════════════"
echo "  Config Server : http://localhost:8888/actuator/health"
echo "  Eureka        : http://localhost:8761"
echo "  API Gateway   : http://localhost:8080/actuator/health"
echo "  Services      : 8081-8090 (identity..admin)"
[ -n "$FRONTEND_PID" ] && echo "  Frontend      : http://localhost:3000"
echo "  Logs          : $LOG_DIR"
echo ""
echo "  Stop everything with: ./scripts/stop-all.sh"

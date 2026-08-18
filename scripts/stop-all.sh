#!/bin/bash
# ============================================================
# Skill Infinity - Stop all locally-run backend services
# (Windows / Git Bash compatible - uses PowerShell, not pkill)
# ============================================================
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Stopping Skill Infinity backend services..."

SERVICE_JARS=(
  "config-server-1.0.0-SNAPSHOT.jar"
  "discovery-server-1.0.0-SNAPSHOT.jar"
  "api-gateway-1.0.0-SNAPSHOT.jar"
  "identity-service-1.0.0-SNAPSHOT.jar"
  "user-service-1.0.0-SNAPSHOT.jar"
  "mentor-service-1.0.0-SNAPSHOT.jar"
  "session-service-1.0.0-SNAPSHOT.jar"
  "wallet-service-1.0.0-SNAPSHOT.jar"
  "payment-service-1.0.0-SNAPSHOT.jar"
  "admin-service-1.0.0-SNAPSHOT.jar"
)

for jar in "${SERVICE_JARS[@]}"; do
  # Find java PIDs whose command line contains this jar name and kill them
  powershell -Command "Get-CimInstance Win32_Process -Filter \"Name='java.exe'\" | Where-Object { \$_.CommandLine -like '*$jar*' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force }" 2>/dev/null
done
echo "  backend services stopped."

# Stop vite frontend if running
if [ -f "$ROOT/logs/frontend.pid" ]; then
  FRONTEND_PID=$(cat "$ROOT/logs/frontend.pid" 2>/dev/null || true)
  if [ -n "${FRONTEND_PID:-}" ]; then
    powershell -Command "Stop-Process -Id $FRONTEND_PID -Force" 2>/dev/null
    echo "  frontend stopped (pid $FRONTEND_PID)"
  fi
  rm -f "$ROOT/logs/frontend.pid"
fi

echo ""
echo "Done. Infrastructure containers (MySQL/RabbitMQ) are still running."
echo "Stop them with: docker compose -f docker/docker-compose.yml stop"

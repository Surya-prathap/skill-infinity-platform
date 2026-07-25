#!/bin/bash
# ============================================================
# Skill Infinity - Stop Development
# ============================================================
echo "Stopping Skill Infinity services..."

# Kill Java processes running the services
pkill -f "config-server" 2>/dev/null || true
pkill -f "discovery-server" 2>/dev/null || true
pkill -f "api-gateway" 2>/dev/null || true
pkill -f "identity-service" 2>/dev/null || true

# Kill Node/Frontend processes
pkill -f "vite" 2>/dev/null || true

echo "All services stopped."

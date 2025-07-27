#!/bin/bash

# IBKR Services Restart Script
# This script restarts both IBKR services (5055 and 8080)

SERVER="145.223.80.133"
USER="root"
PASSWORD="214721472147Me."

echo "🔧 Restarting IBKR services..."

# Restart the Docker container with both ports
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'
cd /root/borsa2/api-backend/interactive-brokers-web-api-main
docker compose down
docker compose up -d
sleep 5
docker ps | grep ibkr
ENDSSH

echo "✅ IBKR services restarted!"
echo "📍 Services:"
echo "   - IBKR API: 5055 (external)"
echo "   - IBKR Web: 8080 (external) → 5056 (internal)"
echo ""
echo "💡 To create tunnels:"
echo "   Mac/Linux: ./tunnel-ibkr.sh"
echo "   Windows:   tunnel-ibkr.bat"

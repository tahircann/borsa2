#!/bin/bash

# IBKR SSH Tunnel Script for Mac/Linux
# Creates tunnels for both IBKR services

SERVER="145.223.80.133"
USER="root"
PASSWORD="214721472147Me."

echo "🔐 Creating SSH tunnels for IBKR services..."
echo "📍 Services:"
echo "   - IBKR API: localhost:5055 → server:5055"
echo "   - IBKR Web: localhost:8080 → server:8080"
echo ""
echo "⚠️  Keep this terminal open while tunnels are active"
echo "   Press Ctrl+C to close tunnels"
echo ""

# Start both tunnels in background
tunnel1() {
    sshpass -p "$PASSWORD" ssh -L 5055:localhost:5055 -N $USER@$SERVER
}

tunnel2() {
    sshpass -p "$PASSWORD" ssh -L 8080:localhost:8080 -N $USER@$SERVER
}

# Start tunnels
echo "Starting tunnel 1 (5055)..."
tunnel1 &
TUNNEL1_PID=$!

echo "Starting tunnel 2 (8080)..."
tunnel2 &
TUNNEL2_PID=$!

# Wait for tunnels to be ready
sleep 3

echo "✅ Tunnels established!"
echo "🌐 Access URLs:"
echo "   - IBKR API: http://localhost:5055"
echo "   - IBKR Web: http://localhost:8080"
echo ""
echo "📊 Tunnel PIDs: $TUNNEL1_PID, $TUNNEL2_PID"

# Wait for Ctrl+C to close tunnels
trap 'echo "Closing tunnels..."; kill $TUNNEL1_PID $TUNNEL2_PID 2>/dev/null; exit' INT
wait

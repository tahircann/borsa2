#!/bin/bash
# Simple IBKR Tunnel Script - Just tunnels, no restart

SERVER="145.223.80.133"
USER="root"
PASSWORD="214721472147Me."

echo "🔐 Creating SSH tunnels..."
echo "   - IBKR API: localhost:5055"
echo "   - IBKR Web: localhost:8080"
echo ""

# Start tunnels
sshpass -p "$PASSWORD" ssh -L 5055:localhost:5055 -L 8080:localhost:8080 -N $USER@$SERVER

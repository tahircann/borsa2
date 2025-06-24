#!/bin/bash

# Cache Refresh Script for Borsa2 Application
# This script automatically refreshes the application cache

LOG_FILE="/var/log/borsa2-cache-refresh.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Function to check if the application is running
check_app_status() {
    if pm2 describe borsa2-frontend > /dev/null 2>&1; then
        local status=$(pm2 describe borsa2-frontend | grep -o 'online\|stopped\|errored')
        if [ "$status" = "online" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to refresh cache
refresh_cache() {
    local response=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/cache-refresh)
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_message "✅ Cache refresh successful: $body"
        return 0
    else
        log_message "❌ Cache refresh failed (HTTP $http_code): $body"
        return 1
    fi
}

# Function to check IB Gateway status
check_ib_gateway() {
    if pm2 describe ib-gateway > /dev/null 2>&1; then
        local status=$(pm2 describe ib-gateway | grep -o 'online\|stopped\|errored')
        if [ "$status" = "online" ]; then
            log_message "📊 IB Gateway is online"
            return 0
        else
            log_message "⚠️  IB Gateway is not online (status: $status)"
            return 1
        fi
    else
        log_message "⚠️  IB Gateway not found in PM2"
        return 1
    fi
}

# Function to check Flask API status
check_flask_api() {
    local response=$(curl -s -w "%{http_code}" http://localhost:5000/api/summary)
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log_message "🔗 Flask API is responding"
        return 0
    else
        log_message "⚠️  Flask API not responding (HTTP $http_code)"
        return 1
    fi
}

# Function to send notification (optional)
send_notification() {
    local message="$1"
    local type="$2"  # success, warning, error
    
    # You can add webhook notifications here if needed
    # For example, Slack, Discord, or email notifications
    log_message "📢 Notification: $message"
}

# Main execution
main() {
    log_message "🚀 Starting automatic cache refresh..."
    
    # Check if Next.js app is running
    if ! check_app_status; then
        log_message "❌ Borsa2 frontend is not running. Cache refresh aborted."
        send_notification "Cache refresh failed: Frontend not running" "error"
        exit 1
    fi
    
    # Check IB Gateway (optional check, doesn't stop refresh)
    check_ib_gateway
    
    # Check Flask API (optional check, doesn't stop refresh)
    check_flask_api
    
    # Attempt cache refresh
    if refresh_cache; then
        log_message "✅ Automatic cache refresh completed successfully"
        send_notification "Cache refresh completed successfully" "success"
        
        # Optional: Get cache status
        local cache_status=$(curl -s http://localhost:3000/api/cache | jq -r '.status // "unknown"')
        local last_update=$(curl -s http://localhost:3000/api/cache | jq -r '.lastUpdate // "unknown"')
        log_message "📊 Cache status: $cache_status, Last update: $last_update"
        
    else
        log_message "❌ Automatic cache refresh failed"
        send_notification "Cache refresh failed" "error"
        exit 1
    fi
    
    log_message "🏁 Cache refresh script completed"
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main "$@" 
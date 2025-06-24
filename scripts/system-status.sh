#!/bin/bash

# System Status Monitor for Borsa2 Application
# Provides a comprehensive overview of all system components

echo "🚀 BORSA2 SYSTEM STATUS REPORT"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"

# Function to check service status
check_service() {
    local service_name="$1"
    local expected_status="$2"
    
    if pm2 describe "$service_name" > /dev/null 2>&1; then
        local status=$(pm2 describe "$service_name" | grep -o 'online\|stopped\|errored')
        if [ "$status" = "$expected_status" ]; then
            echo "✅ $service_name: $status"
            return 0
        else
            echo "❌ $service_name: $status (expected: $expected_status)"
            return 1
        fi
    else
        echo "❌ $service_name: not found"
        return 1
    fi
}

# Function to check HTTP endpoint
check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    
    local response=$(curl -s -w "%{http_code}" "$url" 2>/dev/null)
    local http_code="${response: -3}"
    
    if [ "$http_code" = "$expected_code" ]; then
        echo "✅ $name: HTTP $http_code"
        return 0
    else
        echo "❌ $name: HTTP $http_code (expected: $expected_code)"
        return 1
    fi
}

# Function to check cache status
check_cache() {
    local cache_response=$(curl -s http://localhost:3000/api/cache 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$cache_response" | jq . > /dev/null 2>&1; then
        local status=$(echo "$cache_response" | jq -r '.status // "unknown"')
        local last_update=$(echo "$cache_response" | jq -r '.lastUpdate // "unknown"')
        local age_minutes=$(( ( $(date +%s) - $(date -d "$last_update" +%s) ) / 60 ))
        
        echo "✅ Cache Status: $status"
        echo "   Last Update: $last_update"
        echo "   Age: ${age_minutes} minutes"
        
        if [ "$status" = "fresh" ]; then
            return 0
        else
            return 1
        fi
    else
        echo "❌ Cache: unavailable or invalid response"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    echo "💾 Disk Usage: ${usage}%"
    
    if [ "$usage" -lt 90 ]; then
        return 0
    else
        echo "⚠️  Warning: Disk usage is high!"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    local memory_info=$(free -h | grep 'Mem:')
    local used=$(echo "$memory_info" | awk '{print $3}')
    local available=$(echo "$memory_info" | awk '{print $7}')
    
    echo "🧠 Memory: Used=$used, Available=$available"
    return 0
}

# Function to check cron job
check_cron() {
    if crontab -l | grep -q "cache-refresh.sh"; then
        echo "✅ Cron Job: Configured"
        return 0
    else
        echo "❌ Cron Job: Not configured"
        return 1
    fi
}

# Function to check log files
check_logs() {
    local log_file="/var/log/borsa2-cache-refresh.log"
    if [ -f "$log_file" ]; then
        local log_size=$(stat -c%s "$log_file")
        local last_entry=$(tail -n 1 "$log_file" 2>/dev/null | cut -d']' -f1 | cut -d'[' -f2)
        echo "📝 Cache Log: ${log_size} bytes, Last: $last_entry"
        return 0
    else
        echo "❌ Cache Log: Not found"
        return 1
    fi
}

echo ""
echo "📊 SERVICE STATUS"
echo "---------------"
check_service "borsa2-frontend" "online"
check_service "borsa2-api" "online"  
check_service "ib-gateway" "online"

echo ""
echo "🌐 API ENDPOINTS"
echo "---------------"
check_endpoint "Next.js Frontend" "http://localhost:3000" "200"
check_endpoint "Flask API" "http://localhost:5000/api/summary" "200"
check_endpoint "IB Gateway" "https://localhost:5055" "302"

echo ""
echo "💾 CACHE SYSTEM"
echo "---------------"
check_cache

echo ""
echo "⚙️  AUTOMATION"
echo "-------------"
check_cron

echo ""
echo "📝 LOGS"
echo "-------"
check_logs

echo ""
echo "💻 SYSTEM RESOURCES"
echo "-------------------"
check_disk_space
check_memory

echo ""
echo "🔄 RECENT CACHE ACTIVITY"
echo "------------------------"
if [ -f "/var/log/borsa2-cache-refresh.log" ]; then
    echo "Last 3 cache refresh attempts:"
    tail -n 6 /var/log/borsa2-cache-refresh.log | grep -E "Starting automatic|Cache refresh" | tail -n 3
else
    echo "No cache activity logs found"
fi

echo ""
echo "📈 NEXT SCHEDULED REFRESH"
echo "-------------------------"
cache_next_update=$(curl -s http://localhost:3000/api/cache 2>/dev/null | jq -r '.nextUpdate // "unknown"')
if [ "$cache_next_update" != "unknown" ]; then
    echo "Next automatic refresh: $cache_next_update"
    
    # Calculate time until next refresh
    if command -v date > /dev/null 2>&1; then
        current_time=$(date +%s)
        next_time=$(date -d "$cache_next_update" +%s 2>/dev/null)
        if [ $? -eq 0 ]; then
            time_diff=$((next_time - current_time))
            hours=$((time_diff / 3600))
            minutes=$(((time_diff % 3600) / 60))
            echo "Time until refresh: ${hours}h ${minutes}m"
        fi
    fi
else
    echo "Next refresh: unknown"
fi

echo ""
echo "================================================"
echo "Report generated successfully at $(date '+%Y-%m-%d %H:%M:%S')" 
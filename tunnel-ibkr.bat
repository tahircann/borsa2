@echo off
REM IBKR Tunnel Script for Windows - with sshpass alternatives

set SERVER=145.223.80.133
set USER=root
set PASSWORD=214721472147Me.

echo 🔐 Creating SSH tunnels for IBKR services...
echo    - IBKR API: localhost:5055 → server:5055
echo    - IBKR Web: localhost:8080 → server:8080
echo Starting tunnel 1 (5055)...
start cmd /k "sshpass -p %PASSWORD% ssh -L 5055:localhost:5055 -N %USER%@%SERVER%"

timeout /t 2

echo Starting tunnel 2 (8080)...
start cmd /k "sshpass -p %PASSWORD% ssh -L 8080:localhost:8080 -N %USER%@%SERVER%"

echo.
echo ✅ Tunnels established in separate windows!
echo 🌐 Access URLs:
echo    - IBKR API: http://localhost:5055
echo    - IBKR Web: http://localhost:8080
echo.
echo 💡 To close tunnels, close the terminal windows or press Ctrl+C in each window
pause

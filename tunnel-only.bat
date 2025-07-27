@echo off
REM IBKR Tunnel Script for Windows - PuTTY/WSL/Git Bash Solutions
REM Bu script Windows'ta IBKR tunnel'ları oluşturmak için çözümler sunar

set SERVER=145.223.80.133
set USER=root
set PASSWORD=214721472147Me.

echo 🔐 IBKR SSH Tunnel Script - Windows Icin
echo ======================================
echo 📍 Tunnel Hedefleri:
echo    - IBKR API: localhost:5055 → server:5055
echo    - IBKR Web: localhost:8080 → server:8080
echo.

REM PuTTY kontrolü
where plink >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ PuTTY plink bulundu! Tunnel oluşturuluyor...
    echo 💡 Şifre istendiğinde girin: %PASSWORD%
    plink.exe -L 5055:localhost:5055 -L 8080:localhost:8080 -N %USER%@%SERVER%
    goto :end
)

REM WSL kontrolü
where wsl >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ WSL bulundu! Linux script kullanılıyor...
    echo 💡 Şifre: %PASSWORD%
    wsl ./tunnel-only.sh
    goto :end
)

REM Git Bash kontrolü
where bash >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ Git Bash bulundu! Linux script kullanılıyor...
    echo 💡 Şifre: %PASSWORD%
    bash ./tunnel-only.sh
    goto :end
)

REM Manual SSH fallback
echo ⚠️  Alternatif çözümler:
echo.
echo 1️⃣  PuTTY ile (Önerilen):
echo    - PuTTY indir: https://www.putty.org/
echo    - Komut: plink.exe -L 5055:localhost:5055 -L 8080:localhost:8080 -N %USER%@%SERVER%
echo.
echo 2️⃣  WSL ile:
echo    - Windows Subsystem for Linux kurulu mu?
echo    - Komut: wsl ./tunnel-only.sh
echo.
echo 3️⃣  Git Bash ile:
echo    - Git for Windows kurulu mu?
echo    - Komut: bash ./tunnel-only.sh
echo.
echo 4️⃣  Manual SSH (şifre isteyecek):
echo    ssh -L 5055:localhost:5055 -L 8080:localhost:8080 -N %USER%@%SERVER%
echo.
echo 💡 Şifre: %PASSWORD%
echo.
pause
exit /b 1

:end
echo ✅ Tunnel kapatıldı!
pause

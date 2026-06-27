@echo off
REM ─────────────────────────────────────────────────────────────
REM  Personal PM — اجرای همزمان سرور + کلاینت روی ویندوز
REM  Personal PM — start server + client together (Windows)
REM ─────────────────────────────────────────────────────────────
REM  - سرور:   http://localhost:4001  (API)
REM  - کلاینت: http://localhost:5173  (UI که بازش کن)
REM  - داده‌ها: پوشه‌ی data/ کنار همین فایل (فایل‌های .md + گیت محلی)
REM
REM  برای توقف: Ctrl+C
REM ─────────────────────────────────────────────────────────────

cd /d "%~dp0"

echo.
echo  [Personal PM] در حال اجرای سرور و کلاینت...
echo  [Personal PM] مرورگر را روی http://localhost:5173 باز کن
echo  [Personal PM] اگر خطای EADDRINUSE دیدید، پروسهٔ قبلی را ببندید:
echo                 netstat -ano ^| findstr :4001
echo                 taskkill /PID ^<pid^> /F
echo.

npm run dev

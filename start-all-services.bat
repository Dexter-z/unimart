@echo off
echo Starting all services in separate terminals...

REM Start Stripe Webhook
start "Stripe Webhook" cmd /k "stripe listen --forward-to localhost:6004/api/create-order"

REM Wait a moment between launches
timeout /t 1 /nobreak >nul

REM Start API Gateway
start "API Gateway" cmd /k "npx nx serve api-gateway"

REM Wait a moment between launches
timeout /t 1 /nobreak >nul

REM Start Auth Service
start "Auth Service" cmd /k "npx nx serve auth-service"

REM Wait a moment between launches
timeout /t 1 /nobreak >nul

REM Start Order Service
start "Order Service" cmd /k "npx nx serve order-service"

REM Wait a moment between launches
timeout /t 1 /nobreak >nul

REM Start Product Service
start "Product Service" cmd /k "npx nx serve product-service"

REM Wait a moment between launches
timeout /t 1 /nobreak >nul

REM Start User UI
start "User UI" cmd /k "npm run user-ui"

REM Wait a moment between launches
timeout /t 1 /nobreak >nul

REM Start Seller UI
start "Seller UI" cmd /k "npm run seller-ui"

echo All services started in separate terminals!
echo Close individual terminal windows to stop specific services.
pause

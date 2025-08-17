# PowerShell script to start all services in separate terminals
# Run this script from the project root directory

Write-Host "Starting all services in separate terminals..." -ForegroundColor Green

# Start Stripe Webhook
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; stripe listen --forward-to localhost:6004/api/create-order"

# Wait a moment between launches
Start-Sleep -Seconds 1

# Start API Gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx nx serve api-gateway"

# Wait a moment between launches
Start-Sleep -Seconds 1

# Start Auth Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx nx serve auth-service"

# Wait a moment between launches
Start-Sleep -Seconds 1

# Start Order Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx nx serve order-service"

# Wait a moment between launches
Start-Sleep -Seconds 1

# Start Product Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx nx serve product-service"

# Wait a moment between launches
Start-Sleep -Seconds 1

# Start User UI
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run user-ui"

# Wait a moment between launches
Start-Sleep -Seconds 1

# Start Seller UI
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run seller-ui"

Write-Host "All services started in separate terminals!" -ForegroundColor Green
Write-Host "Close individual terminal windows to stop specific services." -ForegroundColor Yellow

#!/bin/bash

# Bash script to start all services in separate terminals
# Run this script from the project root directory

echo "Starting all services in separate terminals..."

# Function to start service in new terminal (Windows)
start_service() {
    local title="$1"
    local command="$2"
    cmd.exe /c start "$title" bash -c "$command; exec bash"
    sleep 1
}

# Start all services
start_service "Stripe Webhook" "stripe listen --forward-to localhost:6004/api/create-order"
start_service "API Gateway" "npx nx serve api-gateway"
start_service "Auth Service" "npx nx serve auth-service"
start_service "Order Service" "npx nx serve order-service"
start_service "Product Service" "npx nx serve product-service"
start_service "User UI" "npm run user-ui"
start_service "Seller UI" "npm run seller-ui"

echo "All services started in separate terminals!"
echo "Close individual terminal windows to stop specific services."

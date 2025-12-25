# Render Deployment Guide for UniMart

## Prerequisites
1. Push your code to GitHub (without .env files)
2. Create a Render account at https://render.com

## Services to Deploy on Render

### 1. PostgreSQL Database
- Go to Render Dashboard → New → PostgreSQL
- Choose a name: `unimart-db`
- Save the connection string for other services

### 2. Redis Instance
- Go to Render Dashboard → New → Redis
- Choose a name: `unimart-redis`
- Save the connection string

### 3. Backend Services (Deploy each separately)

#### API Gateway
- New → Web Service
- Connect your GitHub repo
- Build command: `npm install && npx nx build api-gateway`
- Start command: `node apps/api-gateway/dist/main.js`
- Environment variables:
  - DATABASE_URL=<postgres-connection-string>
  - REDIS_URL=<redis-connection-string>
  - PORT=10000

#### Auth Service  
- New → Web Service
- Build command: `npx nx build auth-service`
- Start command: `node apps/auth-service/dist/main.js`
- Environment variables:
  - DATABASE_URL=<postgres-connection-string>
  - REDIS_URL=<redis-connection-string>
  - JWT_SECRET=<your-jwt-secret>
  - PORT=10000

#### Order Service
- New → Web Service  
- Build command: `npx nx build order-service`
- Start command: `node apps/order-service/dist/main.js`
- Environment variables:
  - DATABASE_URL=<postgres-connection-string>
  - STRIPE_SECRET_KEY=<your-stripe-secret>
  - STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
  - PORT=10000

#### Product Service
- New → Web Service
- Build command: `npx nx build product-service` 
- Start command: `node apps/product-service/dist/main.js`
- Environment variables:
  - DATABASE_URL=<postgres-connection-string>
  - IMAGEKIT_PUBLIC_KEY=<your-imagekit-key>
  - IMAGEKIT_PRIVATE_KEY=<your-imagekit-private>
  - PORT=10000

### 4. Frontend Applications

#### User UI (Next.js)
- New → Static Site
- Build command: `cd apps/user-ui && npm run build`
- Publish directory: `apps/user-ui/out` or `apps/user-ui/.next`
- Environment variables:
  - NEXT_PUBLIC_API_URL=<api-gateway-url>
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-publishable>

#### Seller UI (Next.js) 
- New → Static Site
- Build command: `cd apps/seller-ui && npm run build`
- Publish directory: `apps/seller-ui/out` or `apps/seller-ui/.next`
- Environment variables:
  - NEXT_PUBLIC_API_URL=<api-gateway-url>
  - NEXT_PUBLIC_USER_UI_LINK=<user-ui-url>

## Important Notes

### 1. Environment Variables
- Create .env.example files for each service
- Set environment variables in Render dashboard
- Never commit actual .env files

### 2. Database Setup
- Run Prisma migrations after deploying backend services
- Use Render's PostgreSQL connection string

### 3. CORS Configuration
- Update CORS settings in your services to allow Render URLs
- Add your frontend URLs to CORS whitelist

### 4. File Structure for Render
Each service might need a Dockerfile or specific build configuration.

### 5. Kafka Service (Not Supported on Render)

Render does not support running Kafka or Zookeeper as background services. You cannot start Kafka using terminal commands or background processes on Render like you do locally.

**For production deployments:**
- Use a managed Kafka provider (such as Confluent Cloud, Aiven, Upstash, or Redpanda Cloud).
- Update your environment variables (e.g., `KAFKA_BROKER`, `KAFKA_API_KEY`, `KAFKA_API_SECRET`) to use the managed provider's connection details.

**For development/testing:**
- You can continue running Kafka locally on your machine using your current method (multiple terminals for Zookeeper and Kafka server).
- Services deployed on Render will not be able to connect to your local Kafka unless you expose it securely to the internet (not recommended for production).

**Summary:**
- Do not attempt to run Kafka or Zookeeper on Render.
- Always use a managed Kafka service for production deployments on Render.

## Cost Estimation (Render Free Tier)
- PostgreSQL: Free tier available
- Redis: Free tier available  
- Web Services: 750 hours/month free (enough for 1-2 services)
- Static Sites: Unlimited free

## Alternative: Docker Deployment
Consider containerizing your services for easier deployment across multiple services.

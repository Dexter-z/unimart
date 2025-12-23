# UniMart Render Deployment (Free Tier & Docker)

This guide provides step-by-step instructions for deploying UniMart on Render's free tier, as well as an alternative Docker-based deployment approach.

---

## 1. Prerequisites
- Push your code to GitHub (do NOT include .env files)
- Create a free account at https://render.com
- (Optional) Install Docker Desktop for local Docker builds

---

## 2. Deploying on Render Free Tier

### a. Set Up Databases
- **PostgreSQL**: Render Dashboard → New → PostgreSQL → Name: `unimart-db`
- **Redis**: Render Dashboard → New → Redis → Name: `unimart-redis`
- Save connection strings for use in service environment variables

### b. Deploy Backend Services
For each backend (API Gateway, Auth, Order, Product, etc.):
1. Render Dashboard → New → Web Service
2. Connect your GitHub repo
3. Set build/start commands:
   - Build: `npx nx build <service-name>`
   - Start: `node apps/<service-name>/dist/main.js`
4. Set environment variables (from .env.example)
5. Repeat for each backend service

### c. Deploy Frontend Apps
For each frontend (User UI, Seller UI, Admin UI):
1. Render Dashboard → New → Static Site
2. Connect your GitHub repo
3. Build command: `cd apps/<ui-name> && npm run build`
4. Publish directory: `apps/<ui-name>/out` or `apps/<ui-name>/.next`
5. Set environment variables as needed

### d. Environment Variables
- Create .env.example for each service
- Set all required variables in the Render dashboard (never commit secrets)

### e. CORS & Networking
- Update CORS settings in your services to allow Render URLs
- Add frontend URLs to CORS whitelist

### f. Kafka Note
- Render does NOT support running Kafka/Zookeeper. Use a managed Kafka provider (e.g., Confluent Cloud, Aiven, Upstash) and update your .env accordingly.

---

## 3. Docker-Based Deployment (Alternative)

### a. Requirements
- Docker Desktop installed
- (Optional) Docker Compose for multi-service orchestration

### b. Build Docker Images
For each service:
1. Create a `Dockerfile` in the service directory (if not present)
2. Example Dockerfile for Node.js service:
   ```Dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY . .
   RUN npm install --legacy-peer-deps && npx nx build <service-name>
   CMD ["node", "apps/<service-name>/dist/main.js"]
   ```
3. Build image:
   ```sh
   docker build -t unimart-<service-name>:latest .
   ```

### c. Run Containers
- Run each service with required environment variables:
  ```sh
  docker run -d --name <service-name> -p <host-port>:<container-port> --env-file .env unimart-<service-name>:latest
  ```
- For multi-service, create a `docker-compose.yml` file to orchestrate all services, databases, and Redis.

### d. Kafka with Docker
- You can run Kafka and Zookeeper locally using Docker Compose. Example snippet:
  ```yaml
  services:
    zookeeper:
      image: wurstmeister/zookeeper
      ports:
        - "2181:2181"
    kafka:
      image: wurstmeister/kafka
      ports:
        - "9092:9092"
      environment:
        KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
        KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
  ```

---

## 4. Tips & Troubleshooting
- Use Render's free tier for quick prototyping; upgrade for production.
- Use managed services for Kafka in production.
- Always keep secrets out of your repo.
- Check Render logs for build/runtime errors.

---

For more details, see your main `RENDER_DEPLOYMENT.md` or contact the UniMart maintainers.

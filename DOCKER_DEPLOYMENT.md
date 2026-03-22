# Docker Deployment Guide

Complete guide for deploying MERN stack using Docker & Docker Compose.

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- 2GB available RAM
- 1GB available disk space (for images and MongoDB data)

## Local Development with Docker

### Option 1: Quick Start (Recommended)

```bash
# Navigate to project root
cd Zeitgeist

# Start all services
docker-compose up --build

# Wait 30-60 seconds for services to initialize
# Access http://localhost:3000
```

### Option 2: Using Makefile (if on Linux/Mac)

```bash
make build    # Build and start
make logs     # View logs
make down     # Stop all services
```

### Option 3: Step by Step

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## What Gets Deployed

The `docker-compose.yml` includes:

```
┌─────────────────────────────────────────┐
│         Docker Network                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐                       │
│  │   Frontend   │                       │
│  │  :3000       │                       │
│  └──────────────┘                       │
│         ↓                               │
│  ┌──────────────────┐                   │
│  │   Backend API    │                   │
│  │   :5000          │                   │
│  └──────────────────┘                   │
│         ↓                               │
│  ┌──────────────┐                       │
│  │  MongoDB     │                       │
│  │  :27017      │                       │
│  └──────────────┘                       │
│                                         │
└─────────────────────────────────────────┘

External Ports (localhost):
- Frontend: 3000
- Backend: 5000
- MongoDB: 27017
```

## Service Details

### Frontend Container
- **Image**: Node.js 18-Alpine + Serve
- **Port**: 3000
- **Environment**: VITE_API_URL
- **Restart**: always (auto-restart on crash)

### Backend Container
- **Image**: Node.js 18-Alpine + Express
- **Port**: 5000
- **Environment**: MongoDB URI, JWT Secret, etc.
- **Health Check**: HTTP endpoint monitoring
- **Restart**: always

### MongoDB Container
- **Image**: MongoDB 6.0
- **Port**: 27017
- **Credentials**: admin/admin
- **Volume**: Persistent data storage
- **Restart**: always

## Environment Configuration

### Development (default)

File: `docker-compose.yml`

MongoDB credentials in plain compose file for local development:
```yaml
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: admin
```

### Production

Use `docker-compose.prod.yml`:

```bash
# Start with production config
docker-compose -f docker-compose.prod.yml up -d

# Uses environment variables from .env file
# Requires proper secrets management
```

Create `.env` for production:
```env
DB_USER=your_secure_user
DB_PASSWORD=your_very_secure_password
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-domain.com
API_URL=https://your-domain.com/api
```

## Common Docker Commands

### Viewing Services

```bash
# List running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# View logs from last 100 lines
docker-compose logs --tail 100 backend
```

### Managing Services

```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop backend

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Remove everything (containers + volumes = delete database)
docker-compose down -v

# Rebuild specific service
docker-compose up --build backend
```

### Accessing Containers

```bash
# Open shell in backend container
docker-compose exec backend sh

# Open shell in frontend container
docker-compose exec frontend sh

# Run command in container
docker-compose exec backend npm list

# View container logs in detail
docker-compose logs backend --no-log-prefix
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5000
lsof -i :5000

# Kill process using port
kill -9 <PID>

# Or change port in docker-compose.yml:
ports:
  - "5001:5000"  # Map to different port
```

### MongoDB Connection Error

```bash
# Check MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check connection from backend
docker-compose exec backend ping mongodb
```

### Frontend Can't Connect to Backend

```bash
# Inside frontend container, test backend connectivity
docker-compose exec frontend wget -O- http://backend:5000/health

# Check network
docker network ls
docker network inspect zeitgeist_mern-network
```

### Container Won't Start

```bash
# View detailed error logs
docker-compose logs -f <service>

# Rebuild image
docker-compose build --no-cache <service>

# Check resources
docker stats
```

### Permission Denied Errors

```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker daemon
sudo systemctl restart docker
```

## Performance Optimization

### Memory Management

```bash
# Check memory usage
docker stats

# Limit container memory
services:
  backend:
    mem_limit: 512m
    memswap_limit: 512m
```

### Volume Performance

```bash
# Use named volumes for better performance
volumes:
  mongodb_data:
    driver: local
```

### Image Size Reduction

```bash
# Use Alpine base images (included in Dockerfiles)
FROM node:18-alpine

# Check image sizes
docker image ls
docker du <image_id>
```

## Updating Application

### Update Backend Code

```bash
# Copy new code to backend directory
# Then rebuild

docker-compose down
docker-compose up --build backend
```

### Upgrade Dependencies

```bash
# Backend
cd backend
npm install <new_package>
# Review Dockerfile

# Frontend
cd frontend
npm install <new_package>
# Review Dockerfile

# Rebuild
docker-compose up --build
```

## Backup and Restore

### Backup Database

```bash
# Backup MongoDB to file
docker-compose exec mongodb mongodump --archive > backup.archive

# Or backup volume directly
docker run --rm -v zeitgeist_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongodb_backup.tar.gz -C /data .
```

### Restore Database

```bash
# Restore from file
docker-compose exec mongodb mongorestore --archive < backup.archive

# Or restore volume
docker run --rm -v zeitgeist_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## Production Deployment Checklist

### Before Deploying

- [ ] Update `JWT_SECRET` to strong random value
- [ ] Configure proper MongoDB credentials
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` and `API_URL`
- [ ] Configure SSL/TLS certificates
- [ ] Set up log aggregation
- [ ] Configure monitoring and alerts
- [ ] Test failover and recovery
- [ ] Set up automated backups

### Scaling Considerations

```bash
# Run multiple backend instances
docker-compose up --scale backend=3

# Use load balancer (nginx, HAProxy)
# See nginx.conf for example
```

### Cloud Deployment

#### AWS Elastic Container Service (ECS)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name mern-backend
aws ecr create-repository --repository-name mern-frontend

# Push images
docker tag mern-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/mern-backend
docker push <account>.dkr.ecr.<region>.amazonaws.com/mern-backend
```

#### Google Cloud Run

```bash
# Build and push
docker build -t gcr.io/<project>/mern-backend ./backend
docker push gcr.io/<project>/mern-backend

# Deploy
gcloud run deploy mern-backend \
  --image gcr.io/<project>/mern-backend
```

#### Docker Hub

```bash
# Push to Docker Hub
docker tag mern-backend:latest <username>/mern-backend
docker push <username>/mern-backend

# Pull on server
docker pull <username>/mern-backend
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Frontend (check response)
curl http://localhost:3000

# MongoDB (from frontend container)
docker-compose exec frontend mongodb://admin:admin@mongodb:27017/mern-auth
```

### Log Aggregation

```bash
# View structured logs
docker-compose logs --timestamps backend

# Export logs
docker-compose logs > app_logs.txt
```

## Security Best Practices

1. **Never commit .env to git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use secrets management**
   - Docker Swarm Secrets
   - Kubernetes Secrets
   - AWS Secrets Manager

3. **Enable Docker Content Trust**
   ```bash
   export DOCKER_CONTENT_TRUST=1
   ```

4. **Scan images for vulnerabilities**
   ```bash
   docker scan <image>
   ```

5. **Update base images regularly**
   ```bash
   docker pull node:18-alpine
   docker-compose build --no-cache
   ```

## Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Node.js Docker: https://github.com/nodejs/docker-node


# Deployment Guide

## Overview

This document describes how to deploy the Task Management System to production.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web (80)  │────▶│   API (3001)│────▶│  PostgreSQL │
│   Nginx     │     │   Express   │     │   (5432)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Prerequisites

- Docker and Docker Compose v2+
- Domain name with SSL certificate (Let's Encrypt recommended)
- PostgreSQL 16+
- Node.js 24 LTS (for local development)

## Quick Start (Docker Compose)

1. **Clone and configure:**

   ```bash
   git clone <repository>
   cd task-management-system
   cp .env.production.example .env
   # Edit .env with your production values
   ```

2. **Start services:**

   ```bash
   docker compose -f compose.prod.yaml up -d
   ```

3. **Verify deployment:**
   ```bash
   curl http://localhost/health
   curl http://localhost:3001/health
   ```

## Production Deployment

### 1. Environment Variables

Create `.env` from `.env.production.example`:

```env
NODE_ENV=production
PORT=3001
APP_ORIGIN=https://your-domain.com
API_ORIGIN=https://api.your-domain.com

POSTGRES_USER=taskmgmt
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=task_mgmt
DATABASE_URL=postgresql://taskmgmt:your-secure-password@postgres:5432/task_mgmt?schema=public

SESSION_SECRET=your-64-char-random-string-minimum

EMAIL_PROVIDER_KEY=your-sendgrid-or-ses-key
EMAIL_FROM=noreply@your-domain.com

OBJECT_STORAGE_ENDPOINT=https://s3.your-region.amazonaws.com
OBJECT_STORAGE_BUCKET=your-bucket
OBJECT_STORAGE_ACCESS_KEY=your-access-key
OBJECT_STORAGE_SECRET_KEY=your-secret-key
```

### 2. Database Migrations

Run migrations before starting the API:

```bash
docker compose -f compose.prod.yaml run --rm api npx prisma migrate deploy
```

### 3. SSL/TLS

Configure reverse proxy (Nginx/Traefik) with Let's Encrypt:

```nginx
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Run with SSL

```bash
docker compose -f compose.prod.yaml up -d
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yaml`) handles:

1. **Lint & Test** - Runs on every PR/push
2. **Build & Push** - Builds Docker images on push to main
3. **Deploy Staging** - Deploys to staging environment
4. **Deploy Production** - Manual approval required

### Required Secrets

Add these to GitHub repository settings:

- `GITHUB_TOKEN` - Auto-provided
- Docker registry credentials (if using private registry)

## Monitoring

### Health Checks

- **Liveness:** `GET /health` - Basic service status
- **Readiness:** `GET /health/ready` - Includes DB connectivity
- **Metrics:** `GET /metrics` - Prometheus format

### Logs

Structured JSON logs with correlation IDs:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "requestId": "req_abc123",
  "method": "GET",
  "path": "/api/v1/projects",
  "statusCode": 200,
  "duration": 45
}
```

### Prometheus Scraping

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: "task-mgmt-api"
    static_configs:
      - targets: ["api:3001"]
```

## Backup & Recovery

### Database Backup

```bash
# Create backup
docker compose -f compose.prod.yaml exec -T postgres pg_dump -U taskmgmt task_mgmt > backup_$(date +%F).sql

# Restore backup
docker compose -f compose.prod.yaml exec -T postgres psql -U taskmgmt task_mgmt < backup_2024-01-15.sql
```

### Volume Backup

```bash
# Backup PostgreSQL volume
docker run --rm -v task-mgmt_pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata_$(date +%F).tar.gz -C /data .

# Restore
docker run --rm -v task-mgmt_pgdata:/data -v $(pwd):/backup alpine tar xzf /backup/pgdata_2024-01-15.tar.gz -C /data
```

## Scaling

### Horizontal Scaling

- **API:** Run multiple replicas behind load balancer
- **Web:** Static files served by Nginx, easily scalable
- **Database:** Vertical scaling or read replicas

### Session Storage

For horizontal API scaling, use Redis for session storage:

```yaml
# docker-compose.yml addition
redis:
  image: redis:7-alpine
  volumes:
    - redis-data:/data

# API environment
SESSION_STORE=redis
REDIS_URL=redis://redis:6379
```

## Troubleshooting

### Common Issues

1. **Database connection refused**
   - Check PostgreSQL is healthy: `docker compose ps postgres`
   - Verify DATABASE_URL format

2. **CORS errors**
   - Verify APP_ORIGIN and API_ORIGIN match deployed URLs
   - Check CORS headers in API response

3. **Session not persisting**
   - Verify SESSION_SECRET is set and consistent
   - Check cookie domain settings

4. **File upload fails**
   - Check OBJECT_STORAGE credentials
   - Verify bucket permissions

### Logs

```bash
# View all logs
docker compose -f compose.prod.yaml logs -f

# View specific service
docker compose -f compose.prod.yaml logs -f api
docker compose -f compose.prod.yaml logs -f web
```

## Security Checklist

- [ ] Use strong SESSION_SECRET (64+ chars)
- [ ] Use strong PostgreSQL password
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set secure cookie flags (Secure, HttpOnly, SameSite)
- [ ] Configure CSP headers
- [ ] Rate limiting enabled
- [ ] Database not exposed publicly
- [ ] Regular security updates
- [ ] Audit logs monitored
- [ ] Backup encryption enabled

## Rollback Procedure

```bash
# 1. Stop new deployment
docker compose -f compose.prod.yaml down

# 2. Restore database from backup
docker compose -f compose.prod.yaml exec -T postgres psql -U taskmgmt task_mgmt < backup_YYYY-MM-DD.sql

# 3. Deploy previous version
docker compose -f compose.prod.yaml up -d

# 4. Verify health
curl https://your-domain.com/health
```

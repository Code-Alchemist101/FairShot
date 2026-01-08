# Judge0 Docker Setup Guide

## Quick Start

### 1. Start Judge0 with Docker

Run this command in your terminal:

```bash
docker run -d -p 2358:2358 --name judge0 judge0/judge0:latest
```

**What this does:**
- `-d`: Run in detached mode (background)
- `-p 2358:2358`: Map port 2358 (host:container)
- `--name judge0`: Name the container "judge0"
- `judge0/judge0:latest`: Use latest Judge0 image

### 2. Update Environment Variables

Edit `apps/api/.env`:

```env
# Judge0 Configuration (Self-Hosted)
JUDGE0_API_URL=http://localhost:2358

# Remove these (not needed for self-hosted):
# JUDGE0_API_KEY=...
# JUDGE0_HOST=...
```

### 3. Restart Backend

```bash
cd apps/api
npm run start:dev
```

---

## Verify Judge0 is Running

### Check Docker Container

```bash
docker ps
```

You should see:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123...      judge0/judge0:latest     Up 2 minutes   0.0.0.0:2358->2358/tcp
```

### Test API Endpoint

Visit: http://localhost:2358

You should see Judge0 API documentation.

### Test Code Execution

```bash
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "console.log(\"Hello World\");",
    "language_id": 63
  }'
```

---

## Docker Commands

### Stop Judge0
```bash
docker stop judge0
```

### Start Judge0
```bash
docker start judge0
```

### Remove Judge0
```bash
docker rm -f judge0
```

### View Logs
```bash
docker logs judge0
```

---

## Benefits of Self-Hosted Judge0

✅ **Unlimited Requests** - No API rate limits  
✅ **No API Key Needed** - Simpler configuration  
✅ **Faster** - Local execution, no network latency  
✅ **Free** - No subscription costs  
✅ **Privacy** - Code stays on your machine  

---

## Troubleshooting

### Port Already in Use

If port 2358 is taken, use a different port:

```bash
docker run -d -p 3000:2358 --name judge0 judge0/judge0:latest
```

Then update `.env`:
```env
JUDGE0_API_URL=http://localhost:3000
```

### Container Won't Start

Check Docker logs:
```bash
docker logs judge0
```

### Can't Connect

Make sure Docker is running:
```bash
docker --version
```

---

## Production Deployment

For production, use Docker Compose with Redis and PostgreSQL:

Create `docker-compose.judge0.yml`:

```yaml
version: '3.8'

services:
  judge0:
    image: judge0/judge0:latest
    ports:
      - "2358:2358"
    environment:
      - REDIS_URL=redis://redis:6379
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=judge0
      - POSTGRES_USER=judge0
      - POSTGRES_PASSWORD=judge0password
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=judge0
      - POSTGRES_USER=judge0
      - POSTGRES_PASSWORD=judge0password
    ports:
      - "5433:5432"
```

Run:
```bash
docker-compose -f docker-compose.judge0.yml up -d
```

---

**Status:** Self-Hosted Judge0 Ready! 🚀

# FairShot - Manual Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm 9+ installed (`npm --version`)
- ✅ Docker Desktop running
- ✅ Git installed

---

## Step 1: Start Docker Infrastructure

Open a terminal in the project root and run:

```powershell
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker ps

# You should see:
# - fairshot-postgres (port 5432)
# - fairshot-redis (port 6379)
```

**Troubleshooting:**
- If port 5432 is already in use, stop other PostgreSQL instances
- If Docker Desktop isn't running, start it first

---

## Step 2: Install Root Dependencies

```powershell
# In project root
npm install
```

This installs `concurrently` for running multiple dev servers.

---

## Step 3: Setup Backend (NestJS)

### 3.1 Create Backend Directory Structure

```powershell
# Create directories
mkdir -p apps\api\src
mkdir -p apps\api\prisma
```

### 3.2 Copy Prisma Schema

```powershell
# Copy the schema to the correct location
copy prisma\schema.prisma apps\api\prisma\schema.prisma
```

### 3.3 Run the Setup Script

The `setup.sh` script will create all necessary files. Since you're on Windows, run:

```powershell
# Option 1: Use Git Bash (recommended)
bash setup.sh

# Option 2: Use PowerShell script
powershell -ExecutionPolicy Bypass -File setup.ps1
```

**What the script does:**
- Creates `apps/api/package.json` with all NestJS dependencies
- Creates `apps/api/src/` with basic NestJS files (main.ts, app.module.ts, etc.)
- Creates `apps/api/.env` with database connection string
- Creates `apps/web/package.json` with Next.js dependencies
- Creates `apps/web/app/` with basic Next.js files

---

## Step 4: Install Backend Dependencies

```powershell
cd apps\api
npm install
```

**Expected packages:**
- @nestjs/core, @nestjs/common
- @prisma/client, prisma
- @nestjs/websockets, socket.io
- passport, passport-jwt, bcrypt
- bull, axios, stripe

---

## Step 5: Setup Prisma

```powershell
# Still in apps/api directory

# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

**Expected output:**
- Prisma Client generated in `node_modules/@prisma/client`
- Migration created in `prisma/migrations/`
- Database tables created in PostgreSQL

---

## Step 6: Verify Backend

```powershell
# Start NestJS dev server
npm run start:dev
```

**Expected output:**
```
🚀 FairShot API running on http://localhost:4000
📚 API Docs available at http://localhost:4000/api
```

**Test the API:**
- Open browser: http://localhost:4000
- Should see: "FairShot API - Revolutionary Hiring Platform"
- Health check: http://localhost:4000/health
- Swagger docs: http://localhost:4000/api

**Press Ctrl+C to stop the server**

---

## Step 7: Setup Frontend (Next.js)

```powershell
# Open a new terminal
cd apps\web
npm install
```

**Expected packages:**
- next, react, react-dom
- tailwindcss, autoprefixer, postcss
- @radix-ui/* (Shadcn components)
- socket.io-client, webgazer
- @monaco-editor/react

---

## Step 8: Initialize Shadcn UI

```powershell
# Still in apps/web directory
npx shadcn-ui@latest init
```

**When prompted:**
- ✅ Would you like to use TypeScript? **Yes**
- ✅ Which style would you like to use? **Default**
- ✅ Which color would you like to use? **Slate**
- ✅ Where is your global CSS file? **app/globals.css**
- ✅ Would you like to use CSS variables? **Yes**
- ✅ Where is your tailwind.config located? **tailwind.config.ts**
- ✅ Configure import alias? **@/***

**Note:** The `components.json` file is already created, so it should auto-detect settings.

---

## Step 9: Add Shadcn Components

```powershell
# Add commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

---

## Step 10: Verify Frontend

```powershell
# Start Next.js dev server
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Test the frontend:**
- Open browser: http://localhost:3000
- Should see: "Welcome to FairShot - Revolutionary Hiring Platform"

**Press Ctrl+C to stop the server**

---

## Step 11: Run Both Servers Simultaneously

From the **project root**, you can run both servers at once:

```powershell
npm run dev
```

This uses `concurrently` to run:
- Backend: http://localhost:4000
- Frontend: http://localhost:3000

---

## Step 12: Verify Database Connection

```powershell
# Open Prisma Studio
cd apps\api
npx prisma studio
```

**Expected:**
- Opens browser at http://localhost:5555
- Shows all database tables (User, Student, Company, Job, etc.)
- Tables should be empty (no data yet)

---

## Troubleshooting

### Docker containers not starting

```powershell
# Check Docker Desktop is running
docker --version

# View container logs
docker-compose logs postgres
docker-compose logs redis

# Restart containers
docker-compose down
docker-compose up -d
```

### Prisma migration fails

```powershell
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init
```

### Port already in use

```powershell
# Find process using port 4000 (backend)
netstat -ano | findstr :4000

# Find process using port 3000 (frontend)
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F
```

### Module not found errors

```powershell
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd apps\api
rm -rf node_modules package-lock.json
npm install

# For frontend
cd apps\web
rm -rf node_modules package-lock.json
npm install
```

---

## Environment Variables Checklist

### Backend (.env in apps/api/)

```env
DATABASE_URL="postgresql://fairshot:fairshot_dev_password@localhost:5432/fairshot_db?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_in_production
REDIS_URL=redis://localhost:6379
JUDGE0_API_KEY=your_rapidapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
PORT=4000
```

### Frontend (.env.local in apps/web/)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

---

## Next Steps After Setup

1. ✅ Verify both servers are running
2. ✅ Check Prisma Studio shows all tables
3. ✅ Test API health endpoint
4. ✅ Test frontend loads correctly

**You're now ready to start building features!**

Refer to the [Implementation Plan](../../../.gemini/antigravity/brain/a3dde272-61c8-4d5c-bd81-b7b38117a149/implementation_plan.md) for the next phase.

---

## Quick Reference Commands

```powershell
# Start infrastructure
docker-compose up -d

# Start both dev servers
npm run dev

# Backend only
cd apps\api && npm run start:dev

# Frontend only
cd apps\web && npm run dev

# Database GUI
cd apps\api && npx prisma studio

# Generate Prisma client
cd apps\api && npx prisma generate

# Create migration
cd apps\api && npx prisma migrate dev --name migration_name

# Stop infrastructure
docker-compose down
```

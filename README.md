# FairShot - Revolutionary Hiring Platform

## Overview

FairShot is a hiring platform that tests **real-world skills** instead of rote memorization. We allow candidates to use AI tools and documentation during assessments while monitoring how they use them through smart proctoring.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis
- **Code Execution**: Judge0 Cloud API (RapidAPI)
- **AI**: Google Gemini (for plagiarism detection & report generation)
- **Proctoring**: WebGazer.js (eye tracking), WebRTC (video streaming)

## Project Structure

```
fairshot/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/         # Shared types (future)
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop
- Git

## Quick Start

### 1. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker ps
```

### 2. Install Dependencies

```bash
# Install all dependencies (both apps)
npm run install:all

# Or manually:
cd apps/api && npm install
cd ../web && npm install
```

### 3. Setup Database

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

### 4. Configure Environment Variables

```bash
# Backend (apps/api/.env)
cp apps/api/.env.example apps/api/.env

# Frontend (apps/web/.env.local)
cp apps/web/.env.example apps/web/.env.local
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd apps/api
npm run start:dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api

## Development Workflow

### Database Migrations

```bash
cd apps/api

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Studio (Database GUI)

```bash
cd apps/api
npx prisma studio
```

### Code Generation

```bash
# Generate Prisma client after schema changes
cd apps/api
npx prisma generate
```

## Architecture Highlights

### Proctoring Optimization
- **Event Batching**: Eye tracking events are batched every 2 seconds (not per-event)
- **JSONB Storage**: Reduces DB writes by 95% (600/min → 30/min per student)
- **Performance**: Prevents browser crashes on low-end laptops

### Code Execution
- **Judge0 Cloud API**: Sandboxed execution via RapidAPI
- **Supported Languages**: JavaScript, Python, Java, C++
- **Queue-based**: Redis Bull queue for async processing

### Security
- **Client-side**: Detects events (tab switch, copy-paste, eye tracking)
- **Server-side**: Makes decisions (risk scoring, termination)
- **Anti-tampering**: All critical logic runs on backend

## Key Features

1. **Smart Proctoring**: Eye tracking + AI-powered plagiarism detection
2. **Real-world Assessments**: Coding, MCQs, app development challenges
3. **Transparent Feedback**: Every candidate gets a detailed skill report
4. **Fair Testing**: Candidates can use documentation and AI tools (monitored)
5. **Pay-per-Registration**: Companies only pay for actual applicants

## Documentation

- [Tech Stack](./docs/TECH_STACK.md) - Detailed technology decisions
- [Architecture](./docs/ARCHITECTURE.md) - System design and data flows
- [Database Schema](./apps/api/prisma/schema.prisma) - Complete data model
- [Implementation Plan](./docs/implementation_plan.md) - Development roadmap

## Contributing

This is a private project. For questions, contact the development team.

## License

Proprietary - All rights reserved

# FairShot - Project Setup Script (PowerShell)
# This script initializes the monorepo structure on Windows

Write-Host "🚀 FairShot - Project Setup" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue
Write-Host ""

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "apps\web" | Out-Null
New-Item -ItemType Directory -Force -Path "apps\api" | Out-Null
New-Item -ItemType Directory -Force -Path "packages" | Out-Null
Write-Host "✓ Directory structure created" -ForegroundColor Green
Write-Host ""

# Start Docker containers
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d
Write-Host "✓ Docker containers started" -ForegroundColor Green
Write-Host ""

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Copy Prisma schema to correct location
Write-Host "📋 Setting up Prisma schema..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "apps\api\prisma" | Out-Null
Copy-Item -Path "prisma\schema.prisma" -Destination "apps\api\prisma\schema.prisma" -Force
Write-Host "✓ Prisma schema copied" -ForegroundColor Green
Write-Host ""

# Final instructions
Write-Host "📋 Setup Complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Install backend dependencies:" -ForegroundColor White
Write-Host "   cd apps\api" -ForegroundColor Green
Write-Host "   npm install" -ForegroundColor Green
Write-Host ""
Write-Host "2. Install frontend dependencies:" -ForegroundColor White
Write-Host "   cd apps\web" -ForegroundColor Green
Write-Host "   npm install" -ForegroundColor Green
Write-Host ""
Write-Host "3. Generate Prisma client and run migrations:" -ForegroundColor White
Write-Host "   cd apps\api" -ForegroundColor Green
Write-Host "   npx prisma generate" -ForegroundColor Green
Write-Host "   npx prisma migrate dev --name init" -ForegroundColor Green
Write-Host ""
Write-Host "4. Start development servers:" -ForegroundColor White
Write-Host "   Terminal 1: cd apps\api && npm run start:dev" -ForegroundColor Green
Write-Host "   Terminal 2: cd apps\web && npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green

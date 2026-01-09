# Phase 2: Authentication System - Setup Instructions

## ✅ What's Been Created

### Backend (apps/api/src/)
- ✅ **Prisma Module**: Database connection service
- ✅ **Users Module**: CRUD operations for User, Student, Company
- ✅ **Auth Module**: Registration, login, JWT strategy
- ✅ **Guards**: JWT authentication + role-based access control
- ✅ **DTOs**: Validation schemas for auth endpoints

### Frontend (apps/web/)
- ✅ **Auth State**: Zustand store with persistence
- ✅ **API Client**: Axios with JWT interceptors
- ✅ **Login Page**: `/login` with form validation
- ✅ **Register Page**: `/register` with student/company tabs
- ✅ **Dashboards**: Student and company placeholder dashboards
- ✅ **Middleware**: Route protection and role-based redirects

---

## 📋 Installation Steps

### Step 1: Install Backend Dependencies

```powershell
cd apps\api
npm install
```

**Key packages being installed:**
- `@nestjs/jwt` - JWT token generation
- `@nestjs/passport` - Authentication framework
- `passport-jwt` - JWT strategy
- `bcrypt` - Password hashing
- `class-validator` - DTO validation

### Step 2: Install Frontend Dependencies

```powershell
cd apps\web
npm install zustand react-hook-form @hookform/resolvers zod axios
```

**Additional packages:**
- `zustand` - State management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `axios` - HTTP client

### Step 3: Install Shadcn UI Components

```powershell
# Still in apps/web
npx shadcn-ui@latest add button input label card tabs toast alert
```

---

## 🧪 Testing the Authentication System

### 1. Start the Backend

```powershell
cd apps\api
npm run start:dev
```

**Expected output:**
```
✅ Database connected
🚀 FairShot API running on http://localhost:4000
📚 API Docs available at http://localhost:4000/api
```

### 2. Test Registration (Student)

**Using Swagger UI** (http://localhost:4000/api):
1. Go to `POST /auth/register`
2. Click "Try it out"
3. Use this payload:
```json
{
  "email": "student@test.com",
  "password": "password123",
  "role": "STUDENT",
  "fullName": "John Doe",
  "phone": "+91 98765 43210"
}
```
4. Click "Execute"

**Expected response:**
```json
{
  "user": {
    "id": "...",
    "email": "student@test.com",
    "role": "STUDENT",
    "student": {
      "fullName": "John Doe",
      ...
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Test Registration (Company)

```json
{
  "email": "company@test.com",
  "password": "password123",
  "role": "COMPANY",
  "companyName": "Acme Inc.",
  "website": "https://acme.com"
}
```

### 4. Test Login

**Endpoint:** `POST /auth/login`
```json
{
  "email": "student@test.com",
  "password": "password123"
}
```

**Expected response:**
```json
{
  "user": { ... },
  "accessToken": "...",
  "role": "STUDENT"
}
```

### 5. Test Protected Route

**Endpoint:** `GET /auth/profile`
1. Copy the `accessToken` from login response
2. In Swagger, click the "Authorize" button (top right)
3. Enter: `Bearer <your_token>`
4. Try `GET /auth/profile`

**Expected:** Returns your user profile

---

## 🌐 Testing the Frontend

### 1. Start the Frontend

```powershell
cd apps\web
npm run dev
```

**Expected output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

### 2. Test Registration Flow

1. Open http://localhost:3000/register
2. Click "Student" tab
3. Fill in the form:
   - Full Name: John Doe
   - Email: student2@test.com
   - Phone: +91 98765 43210
   - Password: password123
4. Click "Create student account"

**Expected:**
- Success toast appears
- Redirects to `/dashboard`
- Shows student dashboard with profile

### 3. Test Login Flow

1. Open http://localhost:3000/login
2. Enter credentials:
   - Email: student@test.com
   - Password: password123
3. Click "Sign in"

**Expected:**
- Success toast
- Redirects to `/dashboard` (for students) or `/company/dashboard` (for companies)

### 4. Test Route Protection

**Try accessing protected routes without login:**
- http://localhost:3000/dashboard → Redirects to `/login`
- http://localhost:3000/company/dashboard → Redirects to `/login`

**After login as student:**
- http://localhost:3000/dashboard → ✅ Accessible
- http://localhost:3000/company/dashboard → ❌ Redirects to `/`

---

## 🔧 Troubleshooting

### Backend Issues

**Error: "Cannot find module '@prisma/client'"**
```powershell
cd apps\api
npx prisma generate
```

**Error: "Database connection failed"**
```powershell
# Check Docker is running
docker ps

# Restart containers
docker-compose down
docker-compose up -d
```

**Error: "JWT_SECRET is not defined"**
- Check `apps/api/.env` file exists
- Verify `JWT_SECRET` is set

### Frontend Issues

**Error: "Cannot find module 'zustand'"**
```powershell
cd apps\web
npm install zustand
```

**Error: "Component not found"**
```powershell
# Install missing Shadcn components
npx shadcn-ui@latest add button card input label tabs toast alert
```

**Login redirects to `/login` immediately**
- Check browser console for errors
- Verify backend is running on port 4000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

---

## 📊 Database Verification

### View Created Users

```powershell
cd apps\api
npx prisma studio
```

1. Opens http://localhost:5555
2. Click "User" table
3. Should see registered users
4. Click "Student" or "Company" to see profile data

---

## 🎯 Success Checklist

- [ ] Backend starts without errors
- [ ] Swagger UI accessible at http://localhost:4000/api
- [ ] Can register student via API
- [ ] Can register company via API
- [ ] Can login and receive JWT token
- [ ] Protected routes require authentication
- [ ] Frontend starts without errors
- [ ] Can register via frontend form
- [ ] Can login via frontend form
- [ ] Redirects work correctly (student → /dashboard, company → /company/dashboard)
- [ ] Logout clears auth state
- [ ] Prisma Studio shows created users

---

## 🚀 Next Steps (Phase 3)

Once authentication is working:
1. **Job Marketplace**: Companies can post jobs
2. **Application System**: Students can apply
3. **Resource Pack Generator**: AI-generated study materials
4. **Assessment Engine**: MCQ and coding modules

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new user | No |
| POST | `/auth/login` | Login and get JWT | No |
| GET | `/auth/profile` | Get current user | Yes |
| GET | `/users/me` | Get user profile | Yes |
| PUT | `/users/me` | Update profile | Yes |

---

**Status**: ✅ Phase 2 Complete - Authentication System Ready!

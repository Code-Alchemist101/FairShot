# Phase 3: Job Marketplace - Setup & Testing Guide

## ✅ What's Been Implemented

### Backend (apps/api/src/)

#### 1. AI Service (`ai/`)
- **Gemini Integration**: Connects to Google Gemini API for content generation
- **Resource Pack Generation**: Auto-generates study materials (exam pattern, skills, tips, sample questions)
- **Fallback Handling**: Returns default content if AI fails

#### 2. Jobs Module (`jobs/`)
- **Create Job** (`POST /jobs`): Companies can post jobs (verification required)
- **List Jobs** (`GET /jobs`): Browse all active jobs with filters (location, type, company)
- **Get Job** (`GET /jobs/:id`): View job details with company info
- **My Jobs** (`GET /jobs/company/my-jobs`): Company's posted jobs

#### 3. Applications Module (`applications/`)
- **Apply** (`POST /applications/apply/:jobId`): 
  - Checks for duplicate applications
  - **Deducts 1 credit** from company (atomic transaction)
  - Triggers async resource pack generation
- **My Applications** (`GET /applications/my-applications`): Student's applications
- **Job Applications** (`GET /applications/job/:jobId`): Company views applicants
- **Resource Pack** (`GET /applications/resource-pack/:jobId`): Access study materials

### Frontend (apps/web/)

#### 1. Components
- **JobCard**: Displays job info with apply button
- **Badge**: Shadcn UI component for tags

#### 2. Pages
- **Student Dashboard** (`/dashboard`): 
  - Browse Jobs tab: Grid of available jobs
  - My Applications tab: Track applications + access resource packs

---

## 📋 Setup Instructions

### Step 1: Add Gemini API Key

```powershell
# Edit apps/api/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste into `.env`

### Step 2: Restart Backend

```powershell
# Stop the backend (Ctrl+C)
cd apps\api
npm run start:dev
```

### Step 3: Verify Company Credits

For testing, you need to manually add credits to a company account:

```powershell
cd apps\api
npx prisma studio
```

1. Open `Company` table
2. Find your company
3. Set `creditsBalance` to `10` (or any number)
4. Set `verificationStatus` to `VERIFIED`
5. Save

---

## 🧪 Testing the Job Marketplace

### Test 1: Company Posts a Job

**Prerequisites:**
- Logged in as a **COMPANY** user
- Company is **VERIFIED**

**Steps:**
1. Go to http://localhost:4000/api (Swagger)
2. Click "Authorize" and enter your JWT token
3. Go to `POST /jobs`
4. Use this payload:

```json
{
  "title": "Senior Full Stack Developer",
  "description": "We're looking for an experienced developer to join our team...",
  "location": "Remote",
  "jobType": "Full-time",
  "salaryMin": 1000000,
  "salaryMax": 1500000,
  "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
  "assessmentConfig": {
    "modules": ["MCQ", "CODING"],
    "timeLimit": 60,
    "allowedTools": ["MDN", "Stack Overflow"]
  }
}
```

**Expected:**
- Job created successfully
- Returns job object with company details

### Test 2: Student Browses Jobs

**Prerequisites:**
- Logged in as a **STUDENT** user

**Steps:**
1. Go to http://localhost:3000/dashboard
2. Click "Browse Jobs" tab
3. Should see the job you just posted

**Expected:**
- Job card displays with company name, skills, location
- "Apply Now" button is visible

### Test 3: Student Applies to Job

**Prerequisites:**
- Company has `creditsBalance >= 1`

**Steps:**
1. Click "Apply Now" on a job
2. Wait for confirmation toast

**Expected:**
- Toast: "Application submitted!"
- Company's `creditsBalance` decreases by 1
- Application appears in "My Applications" tab

### Test 4: Resource Pack Generation

**Steps:**
1. Go to "My Applications" tab
2. Find the job you applied to
3. Click "Study Now" button

**Expected:**
- Redirects to `/resource-pack/:jobId`
- Shows AI-generated study materials:
  - Exam Pattern
  - Required Skills
  - Preparation Tips
  - Sample Questions

---

## 🔍 Verification Checklist

### Backend API Endpoints

Test via Swagger (http://localhost:4000/api):

- [ ] `POST /jobs` - Creates job (company only, verified)
- [ ] `GET /jobs` - Lists all active jobs
- [ ] `GET /jobs/:id` - Gets job details
- [ ] `POST /applications/apply/:jobId` - Applies to job (deducts credit)
- [ ] `GET /applications/my-applications` - Lists student applications
- [ ] `GET /applications/resource-pack/:jobId` - Gets study materials

### Frontend Pages

- [ ] `/dashboard` - Student can browse jobs
- [ ] `/dashboard` - Student can view applications
- [ ] Job cards display correctly
- [ ] Apply button works
- [ ] "Study Now" button appears after applying

### Database Changes

Check in Prisma Studio:

- [ ] `Job` table has new entries
- [ ] `Application` table has new entries
- [ ] `Company.creditsBalance` decreases after application
- [ ] `ResourcePack` table has AI-generated content

---

## 🐛 Troubleshooting

### "Company must be verified to post jobs"

**Solution:**
```sql
-- In Prisma Studio, update Company table:
verificationStatus = "VERIFIED"
```

### "Company has insufficient credits"

**Solution:**
```sql
-- In Prisma Studio, update Company table:
creditsBalance = 10
```

### "Resource pack not yet generated"

**Cause:** AI generation is async and may take a few seconds

**Solution:**
1. Wait 5-10 seconds
2. Refresh the page
3. Check backend logs for errors

### Gemini API errors

**Check:**
1. `GEMINI_API_KEY` is set in `apps/api/.env`
2. API key is valid (test at https://makersuite.google.com)
3. Backend logs show the error message

**Fallback:** If Gemini fails, the system returns default content

---

## 📊 Expected Database State After Testing

### Job Table
```
id: "abc123"
title: "Senior Full Stack Developer"
companyId: "company_id"
status: "ACTIVE"
requiredSkills: ["JavaScript", "React", "Node.js"]
```

### Application Table
```
id: "app123"
studentId: "student_id"
jobId: "abc123"
status: "ASSESSMENT_PENDING"
```

### Company Table
```
creditsBalance: 9  (was 10, now 9 after 1 application)
```

### ResourcePack Table
```
jobId: "abc123"
examPattern: "You'll face 20 MCQs on JavaScript..."
requiredSkills: "Master React hooks, async/await..."
prepTips: "1. Review JavaScript fundamentals..."
sampleQuestions: [{ type: "MCQ", question: "..." }]
```

---

## 🎯 Next Steps (Phase 4)

After Phase 3 is working:
1. **Company Dashboard**: Add job posting UI (modal/form)
2. **Resource Pack Page**: Create dedicated page to view study materials
3. **Assessment Engine**: Build the actual test-taking interface

---

**Status**: ✅ Phase 3 Backend Complete - Ready for Testing!

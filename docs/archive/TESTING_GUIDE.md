# Phase 5: Reporting & Feedback - Testing Guide

## 🎯 Complete End-to-End Testing Instructions

---

## ✅ Prerequisites

### 1. **Servers Running**
Check that all three services are running:
- ✅ Backend API: http://localhost:4000
- ✅ Frontend: http://localhost:3000
- ✅ Prisma Studio: http://localhost:5555

### 2. **Environment Variables**

**Backend (`apps/api/.env`):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fairshot_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your_gemini_api_key"
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your_rapidapi_key_here"
JUDGE0_HOST="judge0-ce.p.rapidapi.com"
```

**Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### 3. **Get Judge0 API Key**
1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce
2. Click "Subscribe to Test"
3. Choose "Basic" plan (FREE - 50 requests/day)
4. Copy your API key
5. Add to `apps/api/.env`

---

## 📋 Step-by-Step Testing

### **Step 1: Prepare Test Data**

#### 1.1 Create a Coding Problem

Open Prisma Studio (http://localhost:5555):

1. Go to `CodingProblem` table
2. Click "Add record"
3. Fill in:
   ```
   title: "Two Sum"
   description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target."
   difficulty: "javascript"
   tags: ["Array", "Hash Table"]
   testCases: [{"input": "[2,7,11,15], 9", "expectedOutput": "[0,1]"}]
   timeLimitMs: 5000
   memoryLimitMB: 256
   ```
4. Click "Save 1 change"
5. **Copy the `id`** - you'll need this!

---

### **Step 2: Create Test Accounts**

#### 2.1 Register Student Account

**Via Frontend:**
1. Go to http://localhost:3000/register
2. Click "Student" tab
3. Fill in:
   - Full Name: `Test Student`
   - Email: `student@test.com`
   - Password: `password123`
4. Click "Create account"

**Via Swagger (Alternative):**
1. Go to http://localhost:4000/api
2. `POST /auth/register`
3. Body:
```json
{
  "email": "student@test.com",
  "password": "password123",
  "role": "STUDENT",
  "fullName": "Test Student"
}
```

#### 2.2 Register Company Account

1. Go to http://localhost:3000/register
2. Click "Company" tab
3. Fill in:
   - Company Name: `Tech Corp`
   - Website: `https://techcorp.com`
   - Email: `company@test.com`
   - Password: `password123`
4. Click "Create account"

#### 2.3 Verify Company

In Prisma Studio:
1. Go to `Company` table
2. Find "Tech Corp"
3. Set:
   - `verificationStatus` → `VERIFIED`
   - `creditsBalance` → `10`
4. Save

---

### **Step 3: Create Job & Application**

#### 3.1 Login as Company

1. Go to http://localhost:3000/login
2. Login with `company@test.com` / `password123`

#### 3.2 Post a Job (via Swagger)

1. Go to http://localhost:4000/api
2. Click "Authorize"
3. Login as company, copy the `accessToken`
4. Paste in Authorize: `Bearer <token>`
5. Go to `POST /jobs`
6. Click "Try it out"
7. Body:
```json
{
  "title": "Full Stack Developer",
  "description": "We need a skilled developer",
  "location": "Remote",
  "jobType": "Full-time",
  "salaryMin": 1000000,
  "salaryMax": 1500000,
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "assessmentConfig": {
    "modules": ["CODING"],
    "timeLimit": 60
  }
}
```
8. Click "Execute"
9. **Copy the job `id`** from response

#### 3.3 Apply to Job (as Student)

1. Logout from company account
2. Login as `student@test.com` / `password123`
3. Go to http://localhost:3000/dashboard
4. Click "Browse Jobs" tab
5. Find the job and click "Apply Now"
6. Wait for success toast

**Verify in Prisma Studio:**
- Go to `Application` table
- Should see new application
- **Copy the application `id`**

---

### **Step 4: Start Assessment Session**

#### 4.1 Via Swagger API

1. Go to http://localhost:4000/api
2. Authorize with **student** JWT token
3. Go to `POST /assessments/start/:applicationId`
4. Enter your application ID
5. Click "Execute"

**Response:**
```json
{
  "id": "session_id_here",
  "applicationId": "...",
  "studentId": "...",
  "status": "IN_PROGRESS",
  "startTime": "2025-12-03T...",
  ...
}
```

6. **Copy the session `id`**

---

### **Step 5: Test the Assessment IDE**

#### 5.1 Open Assessment Page

Navigate to:
```
http://localhost:3000/assessment/<session_id>
```

Replace `<session_id>` with the ID from Step 4.

#### 5.2 Grant Permissions

When prompted:
- ✅ Allow camera access (for WebGazer)
- ✅ Allow fullscreen

#### 5.3 Verify UI Components

**Check:**
- ✅ Header shows timer (60:00 countdown)
- ✅ "Proctoring Active" green indicator
- ✅ 3 columns visible:
  - Left: Problem description
  - Center: Monaco code editor
  - Right: Browser mock (MDN)

#### 5.4 Test Code Editor

1. Write code in Monaco editor:
```javascript
console.log("Hello World");
```

2. Click "Run Code"
3. Wait for spinner
4. Check result in left panel

**Expected:**
- Status: "Accepted" or "Completed"
- Output: `Hello World`
- Time: ~0.1s

#### 5.5 Test Browser Mock

1. In the right panel, try navigating to:
   - ✅ `developer.mozilla.org` - Should load
   - ❌ `google.com` - Should show error

---

### **Step 6: Test Proctoring**

#### 6.1 Tab Switching

1. While in assessment, press `Alt+Tab` to switch to another window
2. Switch back to assessment
3. Repeat 6 times

**Expected:**
- After 5+ tab switches, you should see a warning alert:
  > "Suspicious activity detected. Please stay focused on the assessment."

#### 6.2 Fullscreen Exit

1. Press `ESC` to exit fullscreen
2. **Expected:** Blocking modal appears
3. Click "Return to Fullscreen"
4. Modal disappears

#### 6.3 Verify Proctoring Data

In Prisma Studio:
1. Go to `ProctoringEvent` table
2. Should see rows with:
   - `sessionId`: Your session ID
   - `events`: JSON array with TAB_SWITCH events
   - `riskScore`: Number (should be > 50 if you switched tabs 6+ times)

---

### **Step 7: Complete Assessment**

1. Click "Finish Test" button
2. Confirm the dialog
3. **Expected:** Redirect to `/dashboard`

**Verify in Prisma Studio:**
- Go to `AssessmentSession` table
- Find your session
- Check:
  - `status` = `COMPLETED`
  - `endTime` is set
  - `codingScore` has a value

---

### **Step 8: View Report (Phase 5)**

#### 8.1 Check Dashboard

1. On `/dashboard`, go to "My Applications" tab
2. Find the application you just completed
3. **Expected:** "Status" badge should be replaced by a **"View Report"** button

#### 8.2 Analyze Report

1. Click "View Report"
2. **Expected UI:**
   - **Overall Score:** Calculated from Coding + Integrity
   - **Integrity Score:** Should be < 100 if you switched tabs
   - **Trust Badge:** Red "Flagged" if Integrity < 50, Green "Verified" if > 80
   - **Radar Chart:** Visualizing your skills
   - **AI Feedback:**
     - Strengths (Generated by Gemini)
     - Weaknesses (Generated by Gemini)
     - Improvement Tips (Generated by Gemini)

#### 8.3 Verify Database

In Prisma Studio:
1. Go to `SkillReport` table
2. Should see a new record linked to your student and application
3. Check `strengths`, `weaknesses` fields contain text (not null)

---

## 🧪 Advanced Testing

### Test Multiple Code Submissions

Try different code snippets:

**JavaScript - Success:**
```javascript
const sum = (a, b) => a + b;
console.log(sum(2, 3));
```

**JavaScript - Error:**
```javascript
console.log(undefinedVariable);
```

**Python (if you have Python problems):**
```python
print("Hello from Python")
```

### Test WebSocket Connection

Open browser DevTools (F12):
1. Go to Network tab
2. Filter: WS (WebSocket)
3. Should see connection to `ws://localhost:4000/proctoring`
4. Click on it to see messages

**Expected messages every 2 seconds:**
```json
{
  "sessionId": "...",
  "events": [
    {"type": "EYE_GAZE", "x": 500, "y": 300, "timestamp": 1234567890},
    {"type": "TAB_SWITCH", "timestamp": 1234567891}
  ]
}
```

---

## 📊 Verification Checklist

### Backend API
- [ ] `POST /assessments/start/:applicationId` works
- [ ] `POST /assessments/submit` executes code via Judge0
- [ ] `POST /assessments/complete/:sessionId` updates session
- [ ] `GET /assessments/session/:sessionId` returns session data
- [ ] `GET /reports/:reportId` returns generated report
- [ ] WebSocket `/proctoring` accepts connections
- [ ] Proctoring batches saved to database

### Frontend
- [ ] Assessment page loads
- [ ] Fullscreen auto-enters
- [ ] Monaco editor loads and highlights code
- [ ] Timer counts down
- [ ] "Run Code" submits and shows results
- [ ] Browser mock validates URLs
- [ ] Proctoring hook initializes WebGazer
- [ ] Tab switches trigger events
- [ ] Fullscreen exit shows modal
- [ ] "Finish Test" redirects to dashboard
- [ ] Dashboard shows "View Report" button
- [ ] Report page renders charts and AI feedback

### Database
- [ ] `AssessmentSession` created with IN_PROGRESS
- [ ] `CodeSubmission` created after running code
- [ ] `ProctoringEvent` batches saved
- [ ] Session updated to COMPLETED after finishing
- [ ] `SkillReport` created with AI feedback

---

## 🐛 Troubleshooting

### Issue: "Judge0 API error"

**Cause:** Invalid or missing API key

**Fix:**
1. Check `JUDGE0_API_KEY` in `.env`
2. Test key at https://rapidapi.com/judge0-official/api/judge0-ce
3. Restart backend: `npm run start:dev`

---

### Issue: "Camera permission denied"

**Cause:** WebGazer needs camera access

**Fix:**
1. Click camera icon in browser address bar
2. Allow camera access
3. Refresh page

---

### Issue: "Fullscreen not working"

**Cause:** Browser doesn't support Fullscreen API (Safari)

**Fix:**
- Use Chrome or Firefox
- Or disable fullscreen enforcement (for testing only)

---

### Issue: "WebSocket connection failed"

**Cause:** Backend not running or wrong URL

**Fix:**
1. Check backend is running on port 4000
2. Verify `NEXT_PUBLIC_WS_URL=http://localhost:4000` in `.env.local`
3. Restart frontend

---

### Issue: "Assessment page shows 404"

**Cause:** Session ID not found

**Fix:**
1. Verify session was created (check Prisma Studio)
2. Use correct session ID in URL
3. Make sure you're logged in as the student who owns the session

---

### Issue: "Code execution timeout"

**Cause:** Judge0 taking too long or infinite loop

**Fix:**
- Judge0 has 10-second timeout
- Check for infinite loops in code
- Try simpler code first

---

### Issue: "Report not found"

**Cause:** Report generation failed or ID mismatch

**Fix:**
1. Check backend logs for "Generating report..."
2. Verify Gemini API key is valid (for AI feedback)
3. Check `SkillReport` table in Prisma Studio

---

## 📈 Expected Database State After Testing

### AssessmentSession
```
id: "session_123"
applicationId: "app_123"
studentId: "student_123"
status: "COMPLETED"
startTime: "2025-12-03T14:00:00Z"
endTime: "2025-12-03T14:05:00Z"
codingScore: 100.0
score: 90.0 (Deducted for tab switches)
integrityScore: 80.0
```

### CodeSubmission
```
id: "sub_123"
sessionId: "session_123"
problemId: "problem_123"
code: "console.log('Hello');"
language: "javascript"
status: "COMPLETED"
stdout: "Hello\n"
executionTimeMs: 150
testCasesPassed: 1
testCasesTotal: 1
```

### ProctoringEvent
```
id: "event_123"
sessionId: "session_123"
batchTimestamp: "2025-12-03T14:02:00Z"
events: [
  {"type": "EYE_GAZE", "x": 500, "y": 300, "timestamp": 1234567890},
  {"type": "TAB_SWITCH", "timestamp": 1234567891},
  {"type": "TAB_SWITCH", "timestamp": 1234567892}
]
riskScore: 20
```

### SkillReport
```
id: "report_123"
applicationId: "app_123"
studentId: "student_123"
overallScore: 90.0
integrityScore: 80.0
strengths: "Good coding style..."
weaknesses: "Distracted frequently..."
improvementTips: "Focus on single task..."
```

---

## 🎉 Success Criteria

You've successfully tested the Assessment Engine if:

1. ✅ Student can start an assessment session
2. ✅ IDE loads with 3-column layout
3. ✅ Code executes via Judge0 and shows results
4. ✅ Proctoring tracks eye gaze and tab switches
5. ✅ Warnings appear for suspicious behavior
6. ✅ Fullscreen enforcement works
7. ✅ Session completes and score is calculated
8. ✅ **Report is generated with AI feedback**
9. ✅ **Dashboard links to the report**
10. ✅ All data is saved to database

---

**Status:** Ready for End-to-End Testing! 🚀

**Next Steps:**
1. Follow this guide step-by-step
2. Report any issues you encounter
3. Once working, consider adding:
   - Multiple problems per session
   - Test case validation
   - Auto-save functionality

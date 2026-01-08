# Ticket 3.2: Assessment MCQ Integration - Testing Guide

**Quick Start**: Testing MCQ integration in the assessment system

---

## 🎯 What We're Testing

1. **startSession** - Should fetch 5 random MCQ questions
2. **submitMCQ** - Should accept quiz answers and calculate scores
3. **completeSession** - Should include MCQ score in total score

---

## 📋 Prerequisites

### **1. Create MCQ Questions First**

You need at least 5 questions in the database. Use the Question Bank:

1. Login as admin: `admin@fairshot.com` / `Admin@123`
2. Go to `/admin/mcq`
3. Create 5+ questions (or use Swagger to bulk create)

**Quick Swagger Method:**
- Go to `http://localhost:4000/api`
- Authorize with admin token
- Use `POST /admin/mcq` to create 5 questions

---

## 🧪 Testing Steps

### **Step 1: Setup Test Data**

#### **1.1: Create a Test Job with MCQ Module**

**Via Prisma Studio** (`http://localhost:5555`):

1. Open `Job` table
2. Find or create a job
3. Edit the `assessmentConfig` field:
   ```json
   {
     "modules": ["MCQ", "CODING"],
     "duration": 60
   }
   ```
4. Save the job

#### **1.2: Create a Test Application**

**Via Prisma Studio**:

1. Open `Application` table
2. Create new application:
   - `studentId`: (use existing student ID)
   - `jobId`: (use the job from step 1.1)
   - `status`: `ACCEPTED`
3. Copy the application ID

---

### **Step 2: Test startSession (Backend)**

#### **Via Swagger** (`http://localhost:4000/api`):

1. **Login as Student**:
   - Use `POST /auth/login`
   - Email: (your student email)
   - Password: (your student password)
   - Copy the JWT token

2. **Authorize**:
   - Click green "Authorize" button
   - Paste student JWT token
   - Click "Authorize"

3. **Start Assessment Session**:
   - Expand `POST /assessments/start/{applicationId}`
   - Click "Try it out"
   - Enter your application ID
   - Click "Execute"

#### **Expected Response** (Status 201):

```json
{
  "id": "session-id-123",
  "applicationId": "app-id-123",
  "studentId": "student-id-123",
  "status": "IN_PROGRESS",
  "startTime": "2025-12-04T15:30:00.000Z",
  "mcqResponses": [
    {
      "id": "response-1",
      "questionId": "question-1",
      "selectedAnswer": null,
      "isCorrect": null,
      "question": {
        "id": "question-1",
        "question": "What is useState in React?",
        "options": ["State hook", "Effect hook", "Ref hook", "Context hook"],
        "difficulty": "MEDIUM",
        "tags": ["React", "Hooks"]
        // Note: correctAnswer is NOT included (security)
      }
    },
    // ... 4 more questions
  ],
  "application": {
    "job": {
      "title": "Frontend Developer",
      "assessmentConfig": {
        "modules": ["MCQ", "CODING"]
      }
    }
  }
}
```

#### **✅ Verification Checklist:**

- [ ] Response includes `mcqResponses` array
- [ ] Array has 5 questions
- [ ] Each question has `id`, `question`, `options`, `difficulty`, `tags`
- [ ] `correctAnswer` is NOT exposed
- [ ] `selectedAnswer` is `null` (not answered yet)
- [ ] Questions are random (run again, should get different questions)

---

### **Step 3: Test submitMCQ (Backend)**

#### **Via Swagger**:

1. **Prepare Answers**:
   - From the response above, note the question IDs
   - Decide on answers (0-3 for each question)

2. **Submit Quiz**:
   - Expand `POST /assessments/submit-mcq`
   - Click "Try it out"
   - Enter request body:

```json
{
  "sessionId": "session-id-123",
  "responses": [
    {
      "questionId": "question-1",
      "selectedAnswer": 0
    },
    {
      "questionId": "question-2",
      "selectedAnswer": 2
    },
    {
      "questionId": "question-3",
      "selectedAnswer": 1
    },
    {
      "questionId": "question-4",
      "selectedAnswer": 3
    },
    {
      "questionId": "question-5",
      "selectedAnswer": 0
    }
  ]
}
```

3. Click "Execute"

#### **Expected Response** (Status 200):

```json
{
  "responses": [
    {
      "id": "response-1",
      "questionId": "question-1",
      "selectedAnswer": 0,
      "isCorrect": true,
      "answeredAt": "2025-12-04T15:35:00.000Z"
    },
    {
      "id": "response-2",
      "questionId": "question-2",
      "selectedAnswer": 2,
      "isCorrect": false,
      "answeredAt": "2025-12-04T15:35:00.000Z"
    }
    // ... 3 more
  ],
  "score": 60,
  "correct": 3,
  "total": 5
}
```

#### **✅ Verification Checklist:**

- [ ] Each response has `isCorrect` calculated
- [ ] `answeredAt` timestamp is set
- [ ] `score` is calculated correctly (correct/total * 100)
- [ ] `correct` count matches your correct answers
- [ ] `total` is 5

---

### **Step 4: Verify in Database**

#### **Via Prisma Studio** (`http://localhost:5555`):

1. **Open MCQResponse table**
2. **Filter by sessionId** (your session ID)
3. **Verify**:
   - [ ] 5 records exist
   - [ ] `selectedAnswer` values match what you submitted
   - [ ] `isCorrect` values are correct
   - [ ] `answeredAt` timestamps are set

---

### **Step 5: Test completeSession (Backend)**

#### **Via Swagger**:

1. **Complete Session**:
   - Expand `POST /assessments/complete/{sessionId}`
   - Click "Try it out"
   - Enter your session ID
   - Click "Execute"

#### **Expected Response** (Status 200):

```json
{
  "id": "session-id-123",
  "status": "COMPLETED",
  "endTime": "2025-12-04T15:40:00.000Z",
  "codingScore": 0,
  "mcqScore": 60,
  "score": 30
}
```

**Score Calculation:**
- If only MCQ: `score = mcqScore`
- If only Coding: `score = codingScore`
- If both: `score = (codingScore * 0.5) + (mcqScore * 0.5)`

In this example:
- `codingScore = 0` (no code submitted)
- `mcqScore = 60` (3 out of 5 correct)
- `score = (0 * 0.5) + (60 * 0.5) = 30`

#### **✅ Verification Checklist:**

- [ ] `status` is `COMPLETED`
- [ ] `endTime` is set
- [ ] `mcqScore` matches submitMCQ result
- [ ] `score` is calculated correctly

---

## 🧪 Complete Test Scenario

### **Scenario: Full Assessment Flow**

1. **Create 5 MCQ questions** (via admin panel)
2. **Create job with MCQ module** (Prisma Studio)
3. **Create application** (Prisma Studio)
4. **Login as student** (Swagger)
5. **Start session** → Get 5 random questions
6. **Submit quiz** → Get score (e.g., 80%)
7. **Complete session** → Final score includes MCQ

---

## ❌ Error Cases to Test

### **1. Submit with Invalid Question ID**

```json
{
  "sessionId": "valid-session-id",
  "responses": [
    {
      "questionId": "invalid-question-id",
      "selectedAnswer": 0
    }
  ]
}
```

**Expected**: Status 404 - "Question invalid-question-id not found"

---

### **2. Submit with Invalid Answer Index**

```json
{
  "sessionId": "valid-session-id",
  "responses": [
    {
      "questionId": "valid-question-id",
      "selectedAnswer": 5
    }
  ]
}
```

**Expected**: Status 400 - Validation error (selectedAnswer must be 0-3)

---

### **3. Submit for Non-Existent Session**

```json
{
  "sessionId": "invalid-session-id",
  "responses": [...]
}
```

**Expected**: Status 404 - "Assessment session not found"

---

### **4. Submit After Session Completed**

1. Complete a session
2. Try to submit MCQ again

**Expected**: Status 400 - "Assessment session is not in progress"

---

## 🔍 Database Verification

### **Check MCQResponse Records**

**Via Prisma Studio**:

1. Open `MCQResponse` table
2. Filter by your `sessionId`
3. Verify:
   - 5 records created
   - `questionId` links to valid questions
   - `selectedAnswer` matches submissions
   - `isCorrect` calculated correctly
   - `answeredAt` timestamps present

### **Check AssessmentSession**

**Via Prisma Studio**:

1. Open `AssessmentSession` table
2. Find your session
3. Verify:
   - `mcqScore` is set after submitMCQ
   - `score` includes MCQ in calculation
   - `status` is COMPLETED after completeSession

---

## 🎯 Quick Test Checklist

### **Backend API**
- [ ] `POST /assessments/start/:applicationId` returns 5 MCQ questions
- [ ] Questions don't include `correctAnswer`
- [ ] `POST /assessments/submit-mcq` calculates scores correctly
- [ ] `POST /assessments/complete/:sessionId` includes MCQ score
- [ ] Error handling works (invalid IDs, wrong status)

### **Database**
- [ ] MCQResponse records created on startSession
- [ ] MCQResponse updated on submitMCQ
- [ ] AssessmentSession has mcqScore field
- [ ] Scores calculated correctly

### **Security**
- [ ] `correctAnswer` never exposed to frontend
- [ ] Student can only access their own sessions
- [ ] Admin cannot start student sessions

---

## 🐛 Troubleshooting

### **"No questions available"**

**Problem**: startSession doesn't create MCQResponse records

**Solutions**:
1. Check if questions exist: `GET /admin/mcq`
2. Verify job has MCQ in `assessmentConfig.modules`
3. Check Prisma client is regenerated: `npx prisma generate`

---

### **"Question not found" on submit**

**Problem**: Question ID doesn't exist

**Solutions**:
1. Use question IDs from startSession response
2. Don't manually create question IDs
3. Check question wasn't deleted

---

### **Score is 0 even with correct answers**

**Problem**: `isCorrect` not calculated

**Solutions**:
1. Check `correctAnswer` in database (Prisma Studio → MCQQuestion)
2. Verify selectedAnswer matches correctAnswer index
3. Check submitMCQ logic in service

---

### **MCQ score not in total score**

**Problem**: completeSession doesn't include MCQ

**Solutions**:
1. Verify mcqResponses exist in session
2. Check completeSession includes mcqResponses in query
3. Restart backend after Prisma changes

---

## 📊 Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Start session with MCQ job | 5 random questions assigned |
| Start session without MCQ | No mcqResponses |
| Submit 5 answers (3 correct) | Score: 60%, correct: 3/5 |
| Complete session (MCQ only) | score = mcqScore |
| Complete session (both) | score = (coding*0.5 + mcq*0.5) |

---

## 🚀 Next Steps

After backend testing is complete:

1. **Frontend Integration**: Add Quiz tab to assessment page
2. **UI Testing**: Test QuizComponent in browser
3. **End-to-End**: Complete assessment flow from student perspective

---

**Testing Time**: ~15 minutes  
**Prerequisites**: 5+ MCQ questions, test job with MCQ module  
**Tools**: Swagger UI, Prisma Studio

**Happy Testing!** 🎉

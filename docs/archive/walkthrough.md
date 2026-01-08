# FairShot - Complete End-to-End Testing Walkthrough (Sprint 1)

**Testing Coverage**: Tickets 1.1 → 3.3  
**Time Required**: ~30 minutes  
**Prerequisites**: Fresh database, backend & frontend running

---

## 🎯 **What We're Testing**

1. ✅ **Admin Verification System** (Ticket 1.1)
2. ✅ **Payment System** (Tickets 2.1, 2.3)
3. ✅ **MCQ Question Bank** (Ticket 3.1)
4. ✅ **Assessment Integration** (Tickets 3.2, 3.3)

---

## 📋 **Prerequisites**

### **Ensure Services Running:**

```bash
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev

# Terminal 3 - Prisma Studio
cd apps/api
npx prisma studio
```

**Verify:**
- ✅ Backend: `http://localhost:4000`
- ✅ Frontend: `http://localhost:3000`
- ✅ Prisma Studio: `http://localhost:5555`
- ✅ Swagger: `http://localhost:4000/api`

---

## 🧪 **Phase 1: Admin Setup & Verification**

### **Step 1.1: Create Admin Account**

**Via Swagger** (`http://localhost:4000/api`):

1. Find `POST /auth/register`
2. Click "Try it out"
3. Use this JSON:

```json
{
  "email": "admin@fairshot.com",
  "password": "Admin@123",
  "role": "ADMIN",
  "fullName": "Admin User"
}
```

4. Click "Execute"
5. **Expected**: Status 201 Created

---

### **Step 1.2: Create MCQ Questions (Admin)**

1. **Login as Admin**:
   - Go to `http://localhost:3000/login`
   - Email: `admin@fairshot.com`
   - Password: `Admin@123`

2. **Navigate to Question Bank**:
   - Go to `http://localhost:3000/admin/mcq`
   - Should see "MCQ Question Bank" page

3. **Create 5 Questions**:

**Question 1:**
- Question: "What is the purpose of useState in React?"
- Options:
  - To manage component state
  - To fetch data from an API
  - To style components
  - To handle routing
- Correct Answer: 0 (first option)
- Difficulty: MEDIUM
- Tags: React, Hooks, useState

**Question 2:**
- Question: "What is the purpose of React's virtual DOM?"
- Options:
  - To directly manipulate the browser DOM
  - To optimize updates by comparing UI differences
  - To store application data persistently
  - To manage routing between pages
- Correct Answer: 1
- Difficulty: MEDIUM
- Tags: React, Virtual DOM, Performance

**Question 3:**
- Question: "Which statement best describes props in React?"
- Options:
  - They are used to store local state
  - They allow components to fetch data
  - They are read-only values passed to components
  - They modify component lifecycle methods
- Correct Answer: 2
- Difficulty: MEDIUM
- Tags: React, Props

**Question 4:**
- Question: "What does lifting state up mean in React?"
- Options:
  - Moving state from a child component to a parent
  - Creating a new state hook
  - Converting class components to functional ones
  - Sharing state using Redux
- Correct Answer: 0
- Difficulty: MEDIUM
- Tags: React, State Management

**Question 5:**
- Question: "What is JSX in React?"
- Options:
  - A CSS framework for styling
  - A syntax extension that lets you write HTML-like code in JavaScript
  - A tool for routing
  - A database query language
- Correct Answer: 1
- Difficulty: MEDIUM
- Tags: React, JSX

4. **Verify in Prisma Studio**:
   - Go to `http://localhost:5555`
   - Open `MCQQuestion` table
   - Should see 5 questions

✅ **Admin Setup Complete!**

---

## 🧪 **Phase 2: Company Registration & Job Creation**

### **Step 2.1: Create Company Account**

1. **Logout** (if logged in as admin)
2. **Go to Signup**: `http://localhost:3000/signup`
3. **Register Company**:
   - Email: `company@test.com`
   - Password: `Test@123`
   - Full Name/Company Name: `Test Company`
   - Role: Select **COMPANY**
4. **Click Register**

---

### **Step 2.2: Verify Company (Admin)**

1. **Login as Admin** again
2. **Go to Admin Dashboard**: `http://localhost:3000/admin`
3. **Verify Company**:
   - Should see "Test Company" in verification queue
   - Click "Verify" button
   - Status should change to VERIFIED

---

### **Step 2.3: Create Job (Company)**

1. **Logout and Login as Company**:
   - Email: `company@test.com`
   - Password: `Test@123`

2. **Go to Company Dashboard**: `http://localhost:3000/dashboard`

3. **Create New Job**:
   - Click "Create Job" or "Post Job"
   - Fill in:
     - **Title**: "Frontend Developer Intern"
     - **Description**: "Looking for React developers"
     - **Location**: "Remote"
     - **Job Type**: "Internship"
     - **Salary Range**: 10000 - 15000 INR
     - **Required Skills**: React, JavaScript
     - **Assessment Config**: 
       ```json
       {
         "modules": ["MCQ", "CODING"],
         "duration": 60
       }
       ```
   - Click "Publish Job"

4. **Verify Job Created**:
   - Should see job in company dashboard
   - Status: ACTIVE

---

## 🧪 **Phase 3: Student Application & Assessment**

### **Step 3.1: Create Student Account**

1. **Logout**
2. **Go to Signup**: `http://localhost:3000/signup`
3. **Register Student**:
   - Email: `student@test.com`
   - Password: `Test@123`
   - Full Name: `Test Student`
   - Role: Select **STUDENT**
4. **Click Register**

---

### **Step 3.2: Apply to Job**

1. **Login as Student**:
   - Email: `student@test.com`
   - Password: `Test@123`

2. **Go to Dashboard**: `http://localhost:3000/dashboard`

3. **Browse Jobs**:
   - Click "Browse Jobs" tab
   - Should see "Frontend Developer Intern"

4. **Apply to Job**:
   - Click "Apply" button
   - Should see success toast
   - Application created

5. **Check Application**:
   - Click "My Applications" tab
   - Should see "Frontend Developer Intern"
   - Status: ASSESSMENT_PENDING

---

### **Step 3.3: Start Assessment**

1. **In "My Applications" tab**:
   - Find "Frontend Developer Intern"
   - Click "Start Assessment" button

2. **Expected**:
   - API call to `POST /assessments/start/{applicationId}`
   - Redirect to `/assessment/{sessionId}`
   - Assessment page loads

---

### **Step 3.4: Verify Quiz Tab**

**Expected UI:**

```
┌─────────────────────────────────────────────┐
│  Frontend Developer Intern    ⏱ 59:47      │
│  [Problem] [Quiz] [Resources]               │
└─────────────────────────────────────────────┘
```

**✅ Verification:**
- [ ] Three tabs visible: Problem, Quiz, Resources
- [ ] Quiz tab has clipboard icon
- [ ] Timer is running
- [ ] "Run Code" button visible
- [ ] "Finish Test" button visible

---

### **Step 3.5: Take the Quiz**

1. **Click "Quiz" tab**

**Expected Quiz Interface:**

```
┌─────────────────────────────────────────────┐
│  Question 1 of 5  [MEDIUM]  [React] [Hooks] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Progress: ●○○○○                            │
│                                             │
│  What is the purpose of useState in React?  │
│                                             │
│  ○ To manage component state                │
│  ○ To fetch data from an API                │
│  ○ To style components                      │
│  ○ To handle routing                        │
│                                             │
│  [Previous]              [Next]             │
│  0 of 5 questions answered                  │
└─────────────────────────────────────────────┘
```

2. **Answer All Questions**:
   - Select an answer for Question 1
   - Click "Next"
   - Answer Questions 2, 3, 4, 5
   - Progress bar updates as you answer

3. **Submit Quiz**:
   - On Question 5, click "Submit Quiz"
   - Confirmation dialog appears
   - Click "Submit"

**Expected:**
- ✅ Success toast: "Quiz Submitted!"
- ✅ Quiz tab shows checkmark: "Quiz ✓"
- ✅ Component enters readonly mode
- ✅ "Review Mode" badge appears

---

### **Step 3.6: Verify Readonly Mode**

1. **Click through questions**:
   - All answers are visible
   - Radio buttons are disabled
   - Cannot change selections
   - "Quiz already submitted" message on last question

---

### **Step 3.7: Test Code Editor (Optional)**

1. **Click "Problem" tab**
2. **Write some code**:
   ```javascript
   function twoSum(nums, target) {
     // Your solution
     return [0, 1];
   }
   ```
3. **Click "Run Code"**
4. **Verify code execution**

---

### **Step 3.8: Complete Assessment**

1. **Click "Finish Test" button**

**Expected Warning:**
```
Warning: Code not submitted. Are you sure you want to finish the test?
```

2. **Click "OK"**

**Expected:**
- ✅ API call to `POST /assessments/complete/{sessionId}`
- ✅ Success toast: "Assessment Complete!"
- ✅ Redirect to `/dashboard` after 1.5 seconds

---

### **Step 3.9: Verify Completed Assessment**

1. **In Student Dashboard**:
   - Go to "My Applications" tab
   - Find "Frontend Developer Intern"
   - Status should be: ASSESSMENT_COMPLETED

2. **In Prisma Studio**:
   - Open `AssessmentSession` table
   - Find your session
   - Verify:
     - `status`: COMPLETED
     - `mcqScore`: (calculated based on correct answers)
     - `codingScore`: 0 (if no code submitted)
     - `score`: (combined score)

---

## 🧪 **Phase 4: Payment System (Optional)**

### **Step 4.1: Test Billing (Company)**

1. **Login as Company**
2. **Go to Billing**: `http://localhost:3000/company/billing`
3. **View Balance**: Should show current credit balance
4. **Click "Purchase Credits"**
5. **Select Plan**: STARTER or PRO
6. **Checkout**: Redirects to Stripe (test mode)
7. **Use Test Card**: `4242 4242 4242 4242`
8. **Complete Payment**
9. **Verify**: Credits added to balance

---

## ✅ **Complete Test Checklist**

### **Admin Features**
- [ ] Admin account created
- [ ] Admin can login
- [ ] Admin dashboard accessible
- [ ] Company verification works
- [ ] MCQ question creation works
- [ ] 5+ questions created

### **Company Features**
- [ ] Company registration works
- [ ] Company verification by admin
- [ ] Company can login
- [ ] Job creation works
- [ ] Job has MCQ + CODING modules
- [ ] Job is ACTIVE

### **Student Features**
- [ ] Student registration works
- [ ] Student can login
- [ ] Browse jobs works
- [ ] Apply to job works
- [ ] Application status: ASSESSMENT_PENDING

### **Assessment Features**
- [ ] Start Assessment button visible
- [ ] Start Assessment creates session
- [ ] Redirects to assessment page
- [ ] Three tabs visible (Problem, Quiz, Resources)
- [ ] Quiz tab shows 5 questions
- [ ] Question navigation works
- [ ] Answer selection works
- [ ] Progress bar updates
- [ ] Submit quiz works
- [ ] Readonly mode after submit
- [ ] Finish Test works
- [ ] Assessment marked COMPLETED
- [ ] Scores calculated correctly

### **Database Verification**
- [ ] User table has admin, company, student
- [ ] Company status is VERIFIED
- [ ] Job has correct assessmentConfig
- [ ] MCQQuestion table has 5+ questions
- [ ] Application exists with correct status
- [ ] AssessmentSession created
- [ ] MCQResponse records created (5)
- [ ] MCQResponse updated with answers
- [ ] Session has mcqScore and score

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Quiz Tab Not Showing**

**Problem**: Only Problem and Resources tabs visible

**Solutions**:
1. Check job has `"modules": ["MCQ", "CODING"]`
2. Check MCQQuestion table has 5+ questions
3. Delete old sessions in Prisma Studio
4. Start assessment fresh

---

### **Issue 2: 403 Forbidden Error**

**Problem**: Company dashboard shows StudentView

**Solutions**:
1. Clear localStorage: `localStorage.clear()`
2. Logout and login again
3. Verify user role in Prisma Studio

---

### **Issue 3: Session Not Found**

**Problem**: 404 error when loading assessment

**Solutions**:
1. Delete old sessions
2. Go back to dashboard
3. Click "Start Assessment" again

---

## 📊 **Expected Results Summary**

| Feature | Expected Result |
|---------|----------------|
| Admin Login | ✅ Access to admin dashboard |
| Company Verification | ✅ Status changes to VERIFIED |
| MCQ Creation | ✅ 5 questions in database |
| Job Creation | ✅ Job with MCQ + CODING |
| Student Application | ✅ Status: ASSESSMENT_PENDING |
| Start Assessment | ✅ Session created with 5 MCQs |
| Quiz Tab | ✅ Visible with 5 questions |
| Quiz Submission | ✅ Score calculated, readonly mode |
| Complete Assessment | ✅ Status: COMPLETED, scores saved |

---

## 🎉 **Success Criteria**

**All features working if:**

1. ✅ Admin can verify companies
2. ✅ Admin can create MCQ questions
3. ✅ Company can create jobs with MCQ
4. ✅ Student can apply to jobs
5. ✅ Student can start assessment
6. ✅ Quiz tab appears with 5 questions
7. ✅ Student can answer and submit quiz
8. ✅ Readonly mode works after submission
9. ✅ Assessment completes with scores
10. ✅ All data saved correctly in database

---

**Testing Complete!** 🚀

**Total Time**: ~30 minutes  
**Features Tested**: Admin, Payments, MCQ, Assessment  
**Status**: Sprint 1 Complete ✅

# FairShot - Streamlined Testing Guide (From Current State)

**Current Status:**
- ✅ Database reset complete
- ✅ Admin account created
- ✅ Company account created & verified
- ✅ Student account created

**What to Test:** MCQ Questions → Job Creation → Application → Assessment Flow

**Time Required:** ~15 minutes

---

## 🎯 **Testing Roadmap**

```
Admin: Create MCQ Questions (5 mins)
    ↓
Company: Create Job with MCQ (3 mins)
    ↓
Student: Apply to Job (1 min)
    ↓
Student: Take Assessment with Quiz (6 mins)
    ↓
Verify Everything Works ✓
```

---

## 📝 **Phase 1: Create MCQ Questions (Admin)**

**Time:** 5 minutes

### **Step 1: Login as Admin**

1. Go to `http://localhost:3000/login`
2. Login with admin credentials
3. Should redirect to admin dashboard

---

### **Step 2: Navigate to Question Bank**

1. Go to `http://localhost:3000/admin/mcq`
2. Should see "MCQ Question Bank" page
3. Click "Create Question" button

---

### **Step 3: Create 5 Questions**

Create these questions one by one:

#### **Question 1:**
```
Question: What is the purpose of useState in React?
Option 1: To manage component state ✓
Option 2: To fetch data from an API
Option 3: To style components
Option 4: To handle routing
Correct Answer: 0 (first option)
Difficulty: MEDIUM
Tags: React, Hooks
```

#### **Question 2:**
```
Question: What is the virtual DOM in React?
Option 1: A direct copy of browser DOM
Option 2: An optimization technique for UI updates ✓
Option 3: A database for storing data
Option 4: A routing system
Correct Answer: 1
Difficulty: MEDIUM
Tags: React, Performance
```

#### **Question 3:**
```
Question: What are props in React?
Option 1: Local state storage
Option 2: Data fetching methods
Option 3: Read-only values passed to components ✓
Option 4: Lifecycle methods
Correct Answer: 2
Difficulty: MEDIUM
Tags: React, Props
```

#### **Question 4:**
```
Question: What does lifting state up mean?
Option 1: Moving state from child to parent ✓
Option 2: Creating new state hook
Option 3: Converting to functional components
Option 4: Using Redux
Correct Answer: 0
Difficulty: MEDIUM
Tags: React, State
```

#### **Question 5:**
```
Question: What is JSX?
Option 1: A CSS framework
Option 2: HTML-like syntax in JavaScript ✓
Option 3: A routing tool
Option 4: A database language
Correct Answer: 1
Difficulty: MEDIUM
Tags: React, JSX
```

---

### **Step 4: Verify Questions Created**

1. Should see all 5 questions listed
2. Each question shows: Question text, Difficulty, Tags
3. Delete button available for each

✅ **Phase 1 Complete!**

---

## 🏢 **Phase 2: Create Job (Company)**

**Time:** 3 minutes

### **Step 1: Logout & Login as Company**

1. Logout from admin
2. Login as company
3. Should redirect to company dashboard

---

### **Step 2: Create New Job**

1. Click "Create Job" or "Post Job" button
2. Fill in the form:

```
Title: Frontend Developer Intern
Description: Looking for React developers for summer internship
Location: Remote
Job Type: Internship
Salary Min: 10000
Salary Max: 15000
Currency: INR
Required Skills: React, JavaScript (type and press Enter)
```

3. **Assessment Configuration:**
   - Duration: 60 minutes
   - Modules: Select both "MCQ" and "CODING"
   
4. Click "Publish Job" or "Create Job"

---

### **Step 3: Verify Job Created**

1. Should see success message
2. Job appears in company dashboard
3. Status: ACTIVE
4. Shows: Title, Description, Skills, Assessment config

✅ **Phase 2 Complete!**

---

## 🎓 **Phase 3: Apply to Job (Student)**

**Time:** 1 minute

### **Step 1: Logout & Login as Student**

1. Logout from company
2. Login as student
3. Should redirect to student dashboard

---

### **Step 2: Browse & Apply**

1. Click "Browse Jobs" tab
2. Should see "Frontend Developer Intern"
3. Click "Apply" button
4. Success toast appears
5. Application created

---

### **Step 3: Check Application**

1. Click "My Applications" tab
2. Should see "Frontend Developer Intern"
3. Status: **ASSESSMENT_PENDING**
4. Buttons visible: "View Job", "Start Assessment"

✅ **Phase 3 Complete!**

---

## 🎯 **Phase 4: Take Assessment (Student)**

**Time:** 6 minutes

### **Step 1: Start Assessment**

1. In "My Applications" tab
2. Click "Start Assessment" button
3. Should redirect to assessment page
4. URL: `/assessment/{sessionId}`

---

### **Step 2: Verify Assessment Page**

**Expected UI:**

```
┌────────────────────────────────────────────────┐
│ Frontend Developer Intern    ⏱ 59:47  [Finish]│
│ [Problem] [Quiz] [Resources]                   │
└────────────────────────────────────────────────┘
```

**✅ Check:**
- [ ] Three tabs visible
- [ ] Timer running (59:xx)
- [ ] "Run Code" button visible
- [ ] "Finish Test" button visible
- [ ] Proctoring indicator (green dot)

---

### **Step 3: Take the Quiz**

1. **Click "Quiz" tab**

**Expected:**
```
Question 1 of 5  [MEDIUM]  [React] [Hooks]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: ●○○○○

What is the purpose of useState in React?

○ To manage component state
○ To fetch data from an API
○ To style components
○ To handle routing

[Previous]              [Next]
0 of 5 questions answered
```

2. **Answer All 5 Questions:**
   - Select answer for Question 1
   - Click "Next"
   - Answer Questions 2, 3, 4, 5
   - Progress bar fills up: ●●●●●

3. **Submit Quiz:**
   - On Question 5, click "Submit Quiz"
   - Confirmation dialog: "Are you sure?"
   - Click "Submit"

**Expected:**
- ✅ Success toast: "Quiz Submitted!"
- ✅ Quiz tab shows: "Quiz ✓"
- ✅ "Review Mode" badge appears
- ✅ Radio buttons disabled
- ✅ Can't change answers

---

### **Step 4: Review Submitted Quiz**

1. Navigate through questions (Previous/Next)
2. All answers visible
3. All inputs disabled
4. Last question shows: "Quiz already submitted"

---

### **Step 5: Test Code Editor (Optional)**

1. Click "Problem" tab
2. See coding problem (Two Sum)
3. Write some code:
   ```javascript
   function twoSum(nums, target) {
     return [0, 1];
   }
   ```
4. Click "Run Code"
5. See result (Accepted/Error)

---

### **Step 6: Complete Assessment**

1. Click "Finish Test" button (top right)
2. Warning dialog appears:
   ```
   Warning: Code not submitted. 
   Are you sure you want to finish?
   ```
3. Click "OK"

**Expected:**
- ✅ Success toast: "Assessment Complete!"
- ✅ Redirects to dashboard (after 1.5s)

---

### **Step 7: Verify Completion**

1. In "My Applications" tab
2. Find "Frontend Developer Intern"
3. Status: **ASSESSMENT_COMPLETED**
4. "View Report" button may appear

✅ **Phase 4 Complete!**

---

## 🔍 **Phase 5: Verify in Database**

**Time:** 2 minutes

### **Open Prisma Studio** (`http://localhost:5555`)

#### **Check 1: MCQQuestion Table**
- Should have 5 questions
- Each has: question, options, correctAnswer, difficulty, tags

#### **Check 2: AssessmentSession Table**
- Find your session (most recent)
- Verify:
  - `status`: COMPLETED
  - `mcqScore`: (e.g., 60 if 3/5 correct)
  - `codingScore`: 0 (if no code submitted)
  - `score`: (combined score, e.g., 30)
  - `startTime` and `endTime` set

#### **Check 3: MCQResponse Table**
- Should have 5 records for your session
- Each has:
  - `questionId`: Links to question
  - `selectedAnswer`: 0-3 (your answer)
  - `isCorrect`: true/false
  - `answeredAt`: timestamp

#### **Check 4: Application Table**
- Your application status: ASSESSMENT_COMPLETED

✅ **All Verified!**

---

## ✅ **Complete Testing Checklist**

### **Admin Features**
- [x] Admin account exists
- [ ] Can login as admin
- [ ] MCQ Question Bank accessible
- [ ] Can create 5 questions
- [ ] Questions appear in list
- [ ] Can delete questions

### **Company Features**
- [x] Company account exists & verified
- [ ] Can login as company
- [ ] Can create job
- [ ] Job has MCQ + CODING modules
- [ ] Job status: ACTIVE
- [ ] Job appears in company dashboard

### **Student Features**
- [x] Student account exists
- [ ] Can login as student
- [ ] Can browse jobs
- [ ] Can apply to job
- [ ] Application status: ASSESSMENT_PENDING
- [ ] "Start Assessment" button visible

### **Assessment Features**
- [ ] Start Assessment creates session
- [ ] Redirects to assessment page
- [ ] Three tabs visible (Problem, Quiz, Resources)
- [ ] Quiz tab shows 5 questions
- [ ] Question navigation works (Previous/Next)
- [ ] Can select answers
- [ ] Progress bar updates
- [ ] Can submit quiz
- [ ] Success toast appears
- [ ] Quiz tab shows checkmark
- [ ] Readonly mode after submit
- [ ] Review Mode badge visible
- [ ] Cannot modify answers
- [ ] Can finish assessment
- [ ] Warning if modules incomplete
- [ ] Redirects to dashboard
- [ ] Application status: COMPLETED

### **Database Verification**
- [ ] 5 MCQQuestion records
- [ ] AssessmentSession created
- [ ] Session status: COMPLETED
- [ ] 5 MCQResponse records
- [ ] Answers saved correctly
- [ ] Scores calculated (mcqScore, score)

---

## 🎯 **Success Criteria**

**Everything works if:**

1. ✅ Admin can create 5 MCQ questions
2. ✅ Company can create job with MCQ module
3. ✅ Student can apply to job
4. ✅ Student can start assessment
5. ✅ Quiz tab appears with 5 questions
6. ✅ Student can answer all questions
7. ✅ Student can submit quiz
8. ✅ Readonly mode works
9. ✅ Student can complete assessment
10. ✅ All data saved in database

---

## 🐛 **Quick Troubleshooting**

### **Quiz Tab Not Showing?**
1. Check job has `"modules": ["MCQ", "CODING"]`
2. Verify 5+ questions in MCQQuestion table
3. Delete old sessions in Prisma Studio
4. Start assessment fresh

### **403 Forbidden Error?**
1. Clear browser localStorage
2. Logout and login again
3. Check user role in Prisma Studio

### **Can't Submit Quiz?**
1. Ensure all 5 questions answered
2. Check answer count at bottom
3. Navigate through all questions

---

## 🎉 **Testing Complete!**

**Total Time:** ~15 minutes  
**Features Tested:** Admin, Company, Student, Assessment, Quiz  
**Status:** Sprint 1 (Tickets 1.1 - 3.3) ✅

**Your application is ready for demo!** 🚀

# Ticket 3.3: Student Quiz Interface - Testing Guide

**Quick Start**: End-to-end UI testing for the Quiz Interface

---

## 🎯 What We're Testing

1. **Assessment Page Tabs** - Problem, Quiz, Resources tabs
2. **Quiz Component** - Question navigation, answer selection, submission
3. **Readonly Mode** - Review submitted quiz
4. **Complete Flow** - Full assessment with MCQ + Coding

---

## 📋 Prerequisites

### **1. Ensure Backend is Running**

```bash
# In apps/api terminal
npm run start:dev
```

**Verify**: `http://localhost:4000` should be accessible

### **2. Ensure Frontend is Running**

```bash
# In apps/web terminal
npm run dev
```

**Verify**: `http://localhost:3000` should be accessible

### **3. Have Test Data Ready**

You need:
- ✅ 5+ MCQ questions (from Ticket 3.1)
- ✅ A job with MCQ module enabled
- ✅ An application with `ASSESSMENT_PENDING` status
- ✅ A student account

**Quick Setup** (if needed):
1. Login as admin → Create 5 questions at `/admin/mcq`
2. In Prisma Studio → Set job `assessmentConfig.modules = ["MCQ", "CODING"]`
3. In Prisma Studio → Create/update application with `status = "ASSESSMENT_PENDING"`

---

## 🧪 Test Scenario 1: Start Assessment & View Quiz Tab

### **Step 1: Login as Student**

1. Go to `http://localhost:3000/login`
2. Login with student credentials
3. Should redirect to `/dashboard`

### **Step 2: Navigate to Assessment**

**Option A: Direct URL**
```
http://localhost:3000/assessment/{sessionId}
```
(Use session ID from Swagger test in Ticket 3.2)

**Option B: Start from Dashboard**
1. Click "My Applications" tab
2. Find application with assessment
3. Click "Start Assessment" (if available)

### **Step 3: Verify Tabs Appear**

**Expected UI:**
```
┌─────────────────────────────────────────────┐
│  [Problem] [Quiz ✓] [Resources]             │
└─────────────────────────────────────────────┘
```

**✅ Verification:**
- [ ] Three tabs visible
- [ ] Quiz tab has clipboard icon
- [ ] Quiz tab shows checkmark if already submitted
- [ ] Active tab is highlighted

---

## 🧪 Test Scenario 2: Take the Quiz

### **Step 1: Click Quiz Tab**

1. Click on "Quiz" tab
2. Should load QuizComponent

**Expected UI:**
```
┌─────────────────────────────────────────────┐
│  Question 1 of 5    [MEDIUM]                │
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

**✅ Verification:**
- [ ] Question number displayed (1 of 5)
- [ ] Difficulty badge shown (color-coded)
- [ ] Tag badges displayed
- [ ] Progress bar shows 5 segments
- [ ] Question text is readable
- [ ] 4 radio button options
- [ ] Previous button disabled (on question 1)
- [ ] Next button enabled
- [ ] Answer status shows "0 of 5"

---

### **Step 2: Select an Answer**

1. Click on one of the radio button options
2. Option should highlight

**Expected:**
- Selected option has cyan background
- Radio button is filled
- Progress bar updates (first segment turns cyan)
- Answer status updates to "1 of 5"

**✅ Verification:**
- [ ] Option highlights when selected
- [ ] Can change selection
- [ ] Progress bar updates
- [ ] Answer count increases

---

### **Step 3: Navigate Questions**

1. Click "Next" button
2. Should move to Question 2
3. Answer Question 2
4. Continue to Questions 3, 4, 5

**✅ Verification:**
- [ ] Question number updates (2 of 5, 3 of 5, etc.)
- [ ] Previous button enables after question 1
- [ ] Each question has different content
- [ ] Selected answers persist when navigating back
- [ ] Progress bar shows answered questions in cyan

---

### **Step 4: Submit Quiz**

1. Answer all 5 questions
2. Navigate to Question 5
3. "Next" button should change to "Submit Quiz"
4. Click "Submit Quiz"

**Expected: Confirmation Dialog**
```
┌─────────────────────────────────────────┐
│  Submit Quiz?                           │
│                                         │
│  Are you sure you want to submit your   │
│  quiz? You won't be able to change      │
│  your answers after submission.         │
│                                         │
│  [Review Answers]  [Submit]             │
└─────────────────────────────────────────┘
```

5. Click "Submit"

**Expected:**
- Toast notification: "Quiz Submitted!"
- Quiz tab shows checkmark: "Quiz ✓"
- Component enters readonly mode

**✅ Verification:**
- [ ] Submit button only appears on last question
- [ ] Submit disabled until all questions answered
- [ ] Confirmation dialog appears
- [ ] Can cancel and review answers
- [ ] Success toast appears after submit
- [ ] Tab updates with checkmark

---

## 🧪 Test Scenario 3: Readonly Mode (Review Submitted Quiz)

### **Step 1: View Submitted Quiz**

After submitting, the quiz should be in readonly mode.

**Expected UI Changes:**
```
┌─────────────────────────────────────────────┐
│  Question 1 of 5  [MEDIUM]  [Review Mode]   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Progress: ●●●●●  (all filled)              │
│                                             │
│  What is the purpose of useState in React?  │
│                                             │
│  ● To manage component state  (selected)    │
│  ○ To fetch data from an API  (disabled)    │
│  ○ To style components        (disabled)    │
│  ○ To handle routing          (disabled)    │
│                                             │
│  [Previous]    Quiz already submitted       │
└─────────────────────────────────────────────┘
```

**✅ Verification:**
- [ ] "Review Mode" badge appears
- [ ] All radio buttons are disabled
- [ ] Selected answers are visible
- [ ] Cannot change selections
- [ ] Cursor shows "not-allowed" on options
- [ ] Submit button replaced with "Quiz already submitted"
- [ ] Can still navigate questions
- [ ] All progress bars are filled

---

### **Step 2: Navigate Through Reviewed Answers**

1. Click "Next" to view all questions
2. Verify all selected answers are shown
3. Click "Previous" to go back

**✅ Verification:**
- [ ] Can navigate all questions
- [ ] All answers are preserved
- [ ] All inputs remain disabled
- [ ] No way to modify answers

---

## 🧪 Test Scenario 4: Complete Assessment Flow

### **Step 1: Switch Between Tabs**

1. Click "Problem" tab → Should show code editor
2. Click "Quiz" tab → Should show quiz (readonly if submitted)
3. Click "Resources" tab → Should show browser mock

**✅ Verification:**
- [ ] All tabs work
- [ ] Tab state persists
- [ ] No data loss when switching

---

### **Step 2: Finish Test**

1. Click "Finish Test" button (top right)

**Expected: Warning Dialog**
```
Warning: Code not submitted. Are you sure you want to finish the test?
```

2. Click "OK"

**Expected:**
- API call to `/assessments/complete/{sessionId}`
- Toast: "Assessment Complete!"
- Redirect to `/dashboard` after 1.5 seconds

**✅ Verification:**
- [ ] Warning shows if modules not attempted
- [ ] Can cancel finish
- [ ] Success toast appears
- [ ] Redirects to dashboard
- [ ] Session status is COMPLETED in database

---

## 🧪 Test Scenario 5: MCQ-Only Assessment

### **Setup:**

1. In Prisma Studio, set job `assessmentConfig.modules = ["MCQ"]` (remove CODING)
2. Create new assessment session

### **Expected Behavior:**

- Default tab should be "Quiz" (not Problem)
- Only "Quiz" and "Resources" tabs visible
- No "Problem" tab
- No "Run Code" button

**✅ Verification:**
- [ ] Quiz tab is default
- [ ] Problem tab hidden
- [ ] Can complete assessment with only quiz

---

## 🧪 Test Scenario 6: Error Cases

### **Test 1: No Questions Available**

1. Start assessment with job that has no questions in database

**Expected:**
- Quiz tab shows "No questions available"

---

### **Test 2: Network Error During Submit**

1. Stop backend server
2. Try to submit quiz

**Expected:**
- Error toast: "Failed to submit quiz"
- Quiz not marked as submitted
- Can retry after backend restarts

---

### **Test 3: Session Not Found**

1. Use invalid session ID in URL

**Expected:**
- Error toast: "Failed to load assessment session"
- Graceful error handling

---

## 📊 Complete Test Checklist

### **Quiz Component**
- [ ] Question navigation (Previous/Next)
- [ ] Answer selection (radio buttons)
- [ ] Progress indicator updates
- [ ] Answer count updates
- [ ] Submit button on last question
- [ ] Submit disabled until all answered
- [ ] Confirmation dialog
- [ ] Success toast after submit
- [ ] Readonly mode after submit
- [ ] Review Mode badge
- [ ] Disabled inputs in readonly
- [ ] Cannot modify in readonly

### **Assessment Page**
- [ ] Three tabs render correctly
- [ ] Quiz tab conditional (only if MCQ)
- [ ] Tab icons display
- [ ] Checkmark on submitted quiz
- [ ] Default tab logic (Quiz if no coding)
- [ ] Tab switching works
- [ ] State persists across tabs
- [ ] Loading state on page load
- [ ] Session data fetched correctly

### **Finish Test**
- [ ] Warning if quiz not submitted
- [ ] Warning if code not submitted
- [ ] Can cancel finish
- [ ] Success toast on complete
- [ ] Redirects to dashboard
- [ ] Session marked COMPLETED

### **Edge Cases**
- [ ] MCQ-only assessment
- [ ] Coding-only assessment
- [ ] Both modules
- [ ] No questions available
- [ ] Network errors handled
- [ ] Invalid session handled

---

## 🎯 Quick Test Script

**5-Minute Test:**

1. ✅ Login as student
2. ✅ Navigate to assessment
3. ✅ Click Quiz tab
4. ✅ Answer all 5 questions
5. ✅ Submit quiz
6. ✅ Verify readonly mode
7. ✅ Click Finish Test
8. ✅ Verify redirect to dashboard

---

## 🔍 Visual Verification

### **Colors to Check:**

**Difficulty Badges:**
- EASY: Green background
- MEDIUM: Yellow background
- HARD: Red background

**Progress Bar:**
- Answered: Cyan (`bg-cyan-500`)
- Current: Gray (`bg-slate-600`)
- Unanswered: Dark gray (`bg-slate-700`)

**Selected Option:**
- Background: Cyan tint (`bg-cyan-500/10`)
- Border: Cyan (`border-cyan-500/40`)

**Review Mode Badge:**
- Background: Blue tint (`bg-blue-500/10`)
- Text: Blue (`text-blue-400`)

---

## 🐛 Troubleshooting

### **Quiz Tab Not Showing**

**Problem**: Quiz tab doesn't appear

**Solutions:**
1. Check `mcqResponses.length > 0` in session data
2. Verify job has MCQ in `assessmentConfig.modules`
3. Check browser console for errors
4. Verify backend returned questions in startSession

---

### **Questions Not Loading**

**Problem**: "No questions available" message

**Solutions:**
1. Check database has 5+ questions
2. Verify questions created in admin panel
3. Check backend logs for errors
4. Verify session was created with MCQ module

---

### **Submit Button Disabled**

**Problem**: Cannot submit quiz

**Solutions:**
1. Ensure all 5 questions are answered
2. Check answer count at bottom
3. Navigate through all questions
4. Verify no questions skipped

---

### **Readonly Mode Not Working**

**Problem**: Can still modify answers after submit

**Solutions:**
1. Check `quizSubmitted` state
2. Verify `readonly` prop passed to QuizComponent
3. Check `existingAnswers` populated
4. Refresh page to reload session data

---

## 📱 Browser Compatibility

**Test in:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

**Responsive:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)

---

## 🎉 Success Criteria

**All tests pass if:**

1. ✅ Can view quiz tab
2. ✅ Can navigate all questions
3. ✅ Can select answers
4. ✅ Progress updates correctly
5. ✅ Can submit quiz
6. ✅ Readonly mode works
7. ✅ Can complete assessment
8. ✅ Redirects to dashboard

---

**Testing Time**: ~10-15 minutes  
**Prerequisites**: Backend running, test data ready  
**Tools**: Browser, Prisma Studio

**Happy Testing!** 🚀

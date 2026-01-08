# Quiz Radio Button Bug - Final Fix

## 🐛 **Bug Description**

When answering quiz questions:
1. Select option 1 on Question 1
2. Click "Next"
3. Question 2 loads with option 1 pre-selected

This happens for all questions - the previous question's selection appears on the next question.

---

## ✅ **Fix Applied**

### **Root Cause**

The `RadioGroup` component from Radix UI groups radio buttons by the `name` attribute. All questions were sharing the same (or no) `name` attribute, causing radio button state to bleed across questions.

### **Solution**

Added unique `name` prop to each `RadioGroup`:

**File:** `apps/web/components/assessment/QuizComponent.tsx`

**Line 146:**
```typescript
<RadioGroup
    value={answers[currentQuestion.id]?.toString()}
    onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
    className="space-y-3"
    disabled={readonly}
    name={`question-${currentQuestion.id}`}  // ← UNIQUE NAME PER QUESTION
>
```

**Combined with existing unique IDs:**
```typescript
<RadioGroupItem
    value={index.toString()}
    id={`option-${currentQuestion.id}-${index}`}  // ← UNIQUE ID
    className="border-slate-600 text-cyan-500"
    disabled={readonly}
/>
```

---

## 🔄 **Cache Cleared**

I've cleared the Next.js build cache (`.next` directory) to force a complete rebuild with the updated code.

**The dev server is now recompiling...**

---

## 🧪 **Testing Instructions**

### **Step 1: Wait for Rebuild**

Check the terminal running `npm run dev` and wait for:
```
✓ Compiled successfully
```

### **Step 2: Hard Refresh Browser**

**Windows:** `Ctrl + Shift + R` or `Ctrl + F5`  
**Mac:** `Cmd + Shift + R`

### **Step 3: Test the Quiz**

1. Go to the quiz
2. Select option 1 on Question 1
3. Click "Next"
4. **Verify:** Question 2 should have NO option selected ✅

### **Step 4: Verify in DevTools (Optional)**

1. Open DevTools (F12)
2. Go to Elements tab
3. Inspect a radio button
4. Check attributes:
   - `id`: Should be `option-{questionId}-{index}`
   - Parent `<div role="radiogroup">` should have `name="question-{questionId}"`

---

## 🔍 **If Bug Still Persists**

If the bug still exists after the above steps, try these:

### **Option 1: Clear Browser Cache Completely**

**Chrome:**
1. Settings → Privacy and security
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data

**Firefox:**
1. Settings → Privacy & Security
2. Cookies and Site Data → Clear Data
3. Select "Cached Web Content"
4. Clear

### **Option 2: Restart Dev Server**

1. Stop the dev server (Ctrl+C in terminal)
2. Delete `.next` folder:
   ```bash
   cd apps/web
   rm -rf .next
   ```
3. Restart:
   ```bash
   npm run dev
   ```

### **Option 3: Test in Incognito/Private Window**

Open the app in an incognito/private browser window to bypass all caching.

---

## 📊 **Expected Behavior After Fix**

### **Before Fix (Bug):**
```
Q1: Select option 2 → Next
Q2: Option 2 is pre-selected ❌
Q3: Option 2 is pre-selected ❌
```

### **After Fix (Correct):**
```
Q1: Select option 2 → Next
Q2: No option selected ✅
Q3: No option selected ✅
```

### **Saved Answers Still Work:**
```
Q1: Select option 2 → Next
Q2: Select option 3 → Next
Q3: No selection → Previous
Q2: Option 3 still selected ✅ (saved in state)
Q1: Option 2 still selected ✅ (saved in state)
```

---

## 🛠️ **Technical Details**

### **Why This Fix Works**

**HTML Radio Button Grouping:**
- Radio buttons with the same `name` attribute are grouped together
- Only one radio button per group can be selected
- Browsers use `name` to determine which buttons belong together

**The Problem:**
- All questions used the same RadioGroup component
- No unique `name` was set
- Browser treated ALL radio buttons across ALL questions as one group
- Selecting option 2 on Q1 would select option 2 on Q2 (same name, same value)

**The Solution:**
- Each question now has a unique `name`: `question-{questionId}`
- Each question's radio buttons are in a separate group
- Selecting option 2 on Q1 only affects Q1's group
- Q2's group is independent

### **Code Changes**

**Before:**
```typescript
<RadioGroup
    value={answers[currentQuestion.id]?.toString()}
    onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
>
    {/* options */}
</RadioGroup>
```

**After:**
```typescript
<RadioGroup
    value={answers[currentQuestion.id]?.toString()}
    onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
    name={`question-${currentQuestion.id}`}  // ← ADDED THIS
>
    {/* options */}
</RadioGroup>
```

---

## ✅ **Status**

- **Fix Applied:** ✅ Yes
- **Code Updated:** ✅ Yes  
- **Cache Cleared:** ✅ Yes
- **Rebuild Required:** ✅ In Progress
- **Testing Required:** ⏳ Waiting for user

---

## 📝 **Next Steps**

1. **Wait** for dev server to finish compiling
2. **Hard refresh** browser (`Ctrl + Shift + R`)
3. **Test** the quiz
4. **Confirm** bug is fixed

**If the bug is still present after these steps, please let me know and I'll investigate further!**

---

**Fix Applied:** December 5, 2025  
**File Modified:** `apps/web/components/assessment/QuizComponent.tsx`  
**Line:** 146  
**Change:** Added `name={`question-${currentQuestion.id}`}` prop

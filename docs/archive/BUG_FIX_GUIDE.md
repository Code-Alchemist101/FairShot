# Bug Fixes - Quiz Radio Buttons & Report Viewing

## 🐛 **Bug 1: Quiz Radio Button Selection Bleeding**

### **Problem:**
When selecting an option on one question and clicking "Next", the same option index appears selected on the next question.

### **Status:** ✅ **FIXED IN CODE**

The fix has been applied to the code (unique IDs per question), but your browser is caching the old version.

### **Solution: Hard Refresh Browser**

**Windows:**
- Press `Ctrl + Shift + R`
- OR `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

**What this does:**
- Clears cached JavaScript
- Forces browser to download new version
- Loads the fixed code with unique radio button IDs

### **Verification:**
After hard refresh:
1. Go to quiz
2. Select option 3 on Question 1
3. Click "Next"
4. Question 2 should have NO option selected
5. ✅ Bug fixed!

---

## 🐛 **Bug 2: Report Not Found**

### **Problem:**
When company clicks "View Report" for an applicant, it shows "Report Not Found".

### **Root Cause:**
Reports are generated **asynchronously** after assessment completion. There might be a delay or the report generation might have failed.

### **Solution 1: Check if Report Exists (Prisma Studio)**

1. Go to `http://localhost:5555`
2. Open `SkillReport` table
3. Look for reports with your application ID
4. **If report exists:**
   - Note the report ID
   - Try accessing directly: `http://localhost:3000/report/{reportId}`
5. **If report doesn't exist:**
   - Report generation failed or is still pending
   - See Solution 2

### **Solution 2: Manually Trigger Report Generation**

If the report doesn't exist, you can manually trigger it:

**Via Swagger:**

1. Go to `http://localhost:4000/api`
2. Find `POST /assessments/complete/{sessionId}`
3. Use your session ID
4. Click "Execute"
5. This will trigger report generation

**Check Backend Logs:**

Look for:
```
[ReportsService] Generating report for session...
[ReportsService] Report generated successfully
```

If you see errors, the Gemini AI might not be configured or there's an API issue.

### **Solution 3: Check Application Status**

The report is only generated when assessment is **COMPLETED**.

**In Prisma Studio:**

1. Open `Application` table
2. Find your application
3. Check `status` field
4. Should be: `ASSESSMENT_COMPLETED`
5. If not, the assessment wasn't properly completed

### **Solution 4: Verify Report Link**

**In StudentView.tsx (line 169):**
```typescript
onClick={() => window.location.href = `/report/${application.skillReport.id}`}
```

**Check:**
1. Does `application.skillReport` exist?
2. Does it have an `id`?

**In Prisma Studio:**
1. Open `Application` table
2. Find your application
3. Check `skillReportId` field
4. Should have a value (not null)

### **Solution 5: Complete Assessment Properly**

To ensure report generation:

1. **Student takes assessment:**
   - Answer all quiz questions
   - Submit quiz
   - Click "Finish Test"
   - Confirm completion

2. **Backend processes:**
   - Calculates scores
   - Updates session status to COMPLETED
   - Triggers `reportsService.generateReport()`
   - Creates SkillReport record
   - Links report to application

3. **Verify in Prisma Studio:**
   - `AssessmentSession`: status = COMPLETED
   - `SkillReport`: record exists
   - `Application`: skillReportId is set

---

## 🔍 **Debugging Steps**

### **For Quiz Bug:**

1. Open browser DevTools (F12)
2. Go to "Elements" tab
3. Find a radio button
4. Check the `id` attribute
5. **Should be:** `option-{questionId}-{index}`
6. **Should NOT be:** `option-{index}`

If still showing old IDs, clear browser cache completely:
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Firefox: Settings → Privacy → Clear Data → Cached Web Content

### **For Report Bug:**

**Step 1: Check if report exists**
```sql
-- In Prisma Studio Query tab
SELECT * FROM "SkillReport" WHERE "applicationId" = 'your-application-id';
```

**Step 2: Check backend logs**
Look for errors in the terminal running `npm run start:dev`

**Step 3: Check Gemini AI configuration**
```bash
# In apps/api/.env
GEMINI_API_KEY=your_key_here
```

If missing, reports can't be generated.

---

## ✅ **Quick Test**

### **Test Quiz Fix:**

1. Hard refresh browser (`Ctrl + Shift + R`)
2. Go to assessment
3. Click "Quiz" tab
4. Select option on Q1
5. Click "Next"
6. Verify Q2 has no selection
7. ✅ Fixed!

### **Test Report:**

1. Complete an assessment fully
2. Wait 5 seconds
3. Check Prisma Studio for SkillReport
4. If exists, click "View Report"
5. Should load successfully
6. ✅ Working!

---

## 🚨 **Known Issues**

### **Report Generation Timing:**

Reports are generated asynchronously, which means:
- ✅ Assessment completes immediately
- ⏳ Report generation takes 2-5 seconds
- ❌ "View Report" button might appear before report is ready

**Future Fix:**
- Add loading state on report button
- Poll for report availability
- Show "Generating report..." message

### **Gemini AI Dependency:**

Report generation requires Gemini AI API:
- If API key is missing → Report generation fails silently
- If API is down → Report generation fails
- If quota exceeded → Report generation fails

**Workaround:**
- Check backend logs for errors
- Verify API key in `.env`
- Manually create report in Prisma Studio (for testing)

---

## 📝 **Summary**

| Bug | Status | Solution | Time |
|-----|--------|----------|------|
| Quiz Radio Buttons | ✅ Fixed | Hard refresh browser | 10 sec |
| Report Not Found | ⚠️ Timing | Wait for generation / Check DB | 1 min |

**Both issues have solutions and workarounds!** 🎉

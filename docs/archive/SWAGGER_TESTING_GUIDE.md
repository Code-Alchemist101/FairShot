# Swagger API Testing Guide - Question Bank

**Quick Start**: Testing MCQ Question Bank endpoints via Swagger UI

---

## 🚀 Step 1: Access Swagger UI

1. **Open your browser**
2. **Navigate to**: `http://localhost:4000/api`
3. You should see the Swagger UI interface with all API endpoints

---

## 🔐 Step 2: Authenticate as Admin

### **Get Admin JWT Token**

1. **Expand**: `POST /auth/login`
2. **Click**: "Try it out"
3. **Enter credentials**:
   ```json
   {
     "email": "admin@fairshot.com",
     "password": "Admin@123"
   }
   ```
4. **Click**: "Execute"
5. **Copy the token** from the response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

### **Authorize Swagger**

1. **Click**: The green "Authorize" button (top right)
2. **Paste token** in the "Value" field
3. **Click**: "Authorize"
4. **Click**: "Close"

✅ **You're now authenticated!** All protected endpoints will work.

---

## 📝 Step 3: Test Create Question

### **POST /admin/mcq**

1. **Scroll down** to the "admin" section
2. **Expand**: `POST /admin/mcq`
3. **Click**: "Try it out"
4. **Paste this sample question**:

```json
{
  "question": "What is the purpose of `useState` in React?",
  "options": [
    "To manage component state",
    "To fetch data from an API",
    "To style components",
    "To handle routing"
  ],
  "correctAnswer": 0,
  "explanation": "useState is a React Hook that lets you add state to functional components. It returns a stateful value and a function to update it.",
  "difficulty": "MEDIUM",
  "tags": ["React", "Hooks", "useState"]
}
```

5. **Click**: "Execute"

### **Expected Response** (Status 201):

```json
{
  "id": "cm4abc123xyz",
  "question": "What is the purpose of `useState` in React?",
  "options": [
    "To manage component state",
    "To fetch data from an API",
    "To style components",
    "To handle routing"
  ],
  "correctAnswer": 0,
  "explanation": "useState is a React Hook...",
  "difficulty": "MEDIUM",
  "tags": ["React", "Hooks", "useState"],
  "createdAt": "2025-12-04T14:10:00.000Z",
  "updatedAt": "2025-12-04T14:10:00.000Z"
}
```

✅ **Question created successfully!** Copy the `id` for later.

---

## 📋 Step 4: Test Get All Questions

### **GET /admin/mcq**

1. **Expand**: `GET /admin/mcq`
2. **Click**: "Try it out"
3. **Leave filters empty** (or try some):
   - `difficulty`: EASY, MEDIUM, or HARD
   - `tags`: React,Hooks (comma-separated)
   - `page`: 1
   - `limit`: 20
4. **Click**: "Execute"

### **Expected Response** (Status 200):

```json
{
  "questions": [
    {
      "id": "cm4abc123xyz",
      "question": "What is the purpose of `useState` in React?",
      "difficulty": "MEDIUM",
      "tags": ["React", "Hooks", "useState"],
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

✅ **Questions retrieved successfully!**

---

## 🗑️ Step 5: Test Delete Question

### **DELETE /admin/mcq/{id}**

1. **Expand**: `DELETE /admin/mcq/{id}`
2. **Click**: "Try it out"
3. **Paste the question ID** from Step 3 into the `id` field
4. **Click**: "Execute"

### **Expected Response** (Status 200):

```json
{
  "message": "Question deleted successfully"
}
```

✅ **Question deleted!**

---

## 🧪 Test Scenarios

### **Scenario 1: Create Multiple Questions**

Create 3 different questions with different difficulties:

**Easy Question:**
```json
{
  "question": "What does HTML stand for?",
  "options": [
    "Hyper Text Markup Language",
    "High Tech Modern Language",
    "Home Tool Markup Language",
    "Hyperlinks and Text Markup Language"
  ],
  "correctAnswer": 0,
  "difficulty": "EASY",
  "tags": ["HTML", "Basics"]
}
```

**Hard Question:**
```json
{
  "question": "What is the time complexity of QuickSort in the worst case?",
  "options": [
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(log n)"
  ],
  "correctAnswer": 2,
  "explanation": "In the worst case (already sorted array with poor pivot selection), QuickSort degrades to O(n²).",
  "difficulty": "HARD",
  "tags": ["Algorithms", "Sorting", "Complexity"]
}
```

---

### **Scenario 2: Filter by Difficulty**

1. Create questions with different difficulties (EASY, MEDIUM, HARD)
2. Use `GET /admin/mcq?difficulty=MEDIUM`
3. Verify only MEDIUM questions are returned

---

### **Scenario 3: Filter by Tags**

1. Create questions with tags like "React", "JavaScript", "Python"
2. Use `GET /admin/mcq?tags=React`
3. Verify only questions with "React" tag are returned

---

### **Scenario 4: Pagination**

1. Create 25 questions
2. Use `GET /admin/mcq?page=1&limit=10`
3. Verify you get 10 questions
4. Use `GET /admin/mcq?page=2&limit=10`
5. Verify you get the next 10 questions

---

## ❌ Test Error Cases

### **Invalid Data**

**Missing Required Fields:**
```json
{
  "question": "Test question"
  // Missing options, correctAnswer, difficulty, tags
}
```
**Expected**: Status 400 with validation errors

**Wrong Number of Options:**
```json
{
  "question": "Test?",
  "options": ["A", "B"],  // Only 2 options instead of 4
  "correctAnswer": 0,
  "difficulty": "EASY",
  "tags": ["Test"]
}
```
**Expected**: Status 400 - "Must provide exactly 4 options"

**Invalid Correct Answer:**
```json
{
  "question": "Test?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 5,  // Must be 0-3
  "difficulty": "EASY",
  "tags": ["Test"]
}
```
**Expected**: Status 400 - "Correct answer must be between 0 and 3"

**Invalid Difficulty:**
```json
{
  "question": "Test?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "difficulty": "SUPER_HARD",  // Invalid enum value
  "tags": ["Test"]
}
```
**Expected**: Status 400 - "Difficulty must be EASY, MEDIUM, or HARD"

---

### **Unauthorized Access**

1. **Click**: "Authorize" button
2. **Click**: "Logout"
3. **Try**: `POST /admin/mcq`
4. **Expected**: Status 401 Unauthorized

---

### **Non-Admin User**

1. Login as a company or student user
2. Get their JWT token
3. Authorize with their token
4. Try `POST /admin/mcq`
5. **Expected**: Status 403 Forbidden

---

### **Delete Non-Existent Question**

1. Use `DELETE /admin/mcq/invalid-id-123`
2. **Expected**: Status 404 - "Question not found"

---

## 📊 Complete Test Checklist

### **Create Endpoint**
- [ ] Create question with all fields
- [ ] Create question without optional explanation
- [ ] Verify validation for missing fields
- [ ] Verify validation for wrong option count
- [ ] Verify validation for invalid correctAnswer
- [ ] Verify validation for invalid difficulty
- [ ] Verify admin-only access

### **Get Endpoint**
- [ ] Get all questions (no filters)
- [ ] Filter by difficulty (EASY, MEDIUM, HARD)
- [ ] Filter by tags
- [ ] Test pagination (page 1, 2, 3)
- [ ] Test custom limit (5, 10, 20)
- [ ] Verify admin-only access

### **Delete Endpoint**
- [ ] Delete existing question
- [ ] Try to delete non-existent question
- [ ] Verify admin-only access

---

## 🎯 Quick Test Script

**Copy and paste these in order:**

1. **Login as Admin**
2. **Create 3 questions** (Easy, Medium, Hard)
3. **Get all questions** - verify 3 returned
4. **Filter by MEDIUM** - verify 1 returned
5. **Delete one question**
6. **Get all questions** - verify 2 returned

---

## 💡 Tips

1. **Keep Swagger open** - It auto-updates with your changes
2. **Use the "Schemas" section** - See the exact DTO structure
3. **Check response codes**:
   - 200/201 = Success
   - 400 = Validation error
   - 401 = Not authenticated
   - 403 = Not authorized (not admin)
   - 404 = Not found
4. **Copy question IDs** - You'll need them for delete operations
5. **Test edge cases** - Empty strings, special characters, very long text

---

## 🔍 Debugging

**If endpoints don't appear:**
- Refresh the page
- Check backend is running: `http://localhost:4000`
- Check console for errors

**If authorization fails:**
- Verify token is copied correctly (no extra spaces)
- Check token hasn't expired
- Re-login to get a fresh token

**If validation errors:**
- Check the "Schemas" section for exact field requirements
- Verify JSON is valid (use a JSON validator)
- Ensure all required fields are present

---

**Happy Testing!** 🚀

Once you've tested via Swagger, try the frontend UI at `/admin/mcq`!

# Implementation Plan - Human-in-the-Loop AI Generation

## Goal
Allow companies to generate high-quality assessment questions using AI, but review them before they are live. This balances automation with quality control.

## Workflow
1.  **Trigger**: Company clicks "Generate Questions" in Job Details -> Assessment Tab.
2.  **Input**: System sends Job Title, Skills, and Description to Gemini.
3.  **Output**: AI returns JSON array of 5-10 MCQs and 1-2 Coding Problems.
4.  **Review**: Questions appear in a "Draft" modal. Company can Edit or Delete.
5.  **Save**: Company clicks "Confirm". Questions are saved to DB linked to `jobId`.
6.  **Exam**: "Smart Selection" (already built) automatically picks these questions for students.

## Backend Changes

### 1. `AiService` Updates
*   New method: `generateQuestions(jobTitle: string, skills: string[], count: number)`
*   Prompt engineering to ensure strict JSON output matching our DB schema:
    *   MCQ: `question`, `options`, `correctAnswer` (index), `explanation`, `difficulty`, `tags`.
    *   Coding: `title`, `description`, `testCases` (input/output), `difficulty`.

### 2. `JobsController` / `QuestionsController`
*   `POST /jobs/:id/generate-questions`: Calls AI service, returns JSON (does NOT save to DB).
*   `POST /jobs/:id/save-questions`: Receives array of *approved* questions and allows bulk insert into `MCQQuestion` and `CodingProblem` tables.

## Frontend Changes

### 1. Assessment Tab (`apps/web/app/jobs/[jobId]/page.tsx`)
*   New tab alongside "Applicants".
*   Lists existing questions for this job.
*   "Add Manually" button.
*   "Generate with AI" button.

### 2. Generator Modal
*   **Step 1**: Config (High level topic, count).
*   **Step 2**: Loading (Skeleton UI).
*   **Step 3**: Review List (Editable cards).
*   **Step 4**: Saving.

## Verification
[VERIFIED]
1.  [x] Create a "React Developer" job.
2.  [x] Generate questions -> Verify content is about React.
3.  [x] Edit a question (delete bad ones).
4.  [x] Save.
5.  [x] Apply as Student -> Verify the questions appear in the Exam.

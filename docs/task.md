# Product Hardening Phase

- [x] **AI Assessment Pipeline** <!-- id: 20 -->
    - [x] Design DB Schema for AI Questions (MCQ/Coding) <!-- id: 21 -->
    - [x] **Backend**: Implement `AiService.generateQuestions` (MCQ & Coding) <!-- id: 22 -->
    - [x] **Backend**: Add API to Save/Review Questions (`POST /jobs/:id/questions`) <!-- id: 23 -->
    - [x] **Frontend**: Add "Assessment" Tab to Job Details <!-- id: 24 -->
    - [x] **Frontend**: Implement "Review & Save" Workflow (Modal) <!-- id: 29 -->

- [x] **Job Management** <!-- id: 37 -->
    - [x] Implement Edit Job Backend (DTO Updated) <!-- id: 38 -->
    - [x] Create Edit Job Frontend Page <!-- id: 39 -->
    - [x] Add Edit Button to Dashboard <!-- id: 40 -->

- [x] **Proctoring Core Optimization** <!-- id: 25 -->
    - [x] Research WebWorker implementation for WebGazer <!-- id: 26 -->
    - [x] Move face detection/gaze logic off main thread <!-- id: 27 -->
    - [x] Implement "Smart Sampling" (only send data on significant change) <!-- id: 28 -->

- [x] **Critical Bug Fixes** <!-- id: 50 -->
    - [x] Fix Login/Logout Redirect Loop <!-- id: 51 -->
    - [x] Handle Session Timeout gracefully (Fixed via Logout) <!-- id: 52 -->
    - [x] Fix "Answer not provided" in Resource Pack <!-- id: 53 -->
    - [x] Fix "Apply Now" button state after applying <!-- id: 54 -->
    - [x] Real-time "Study Now" button update <!-- id: 55 -->
    - [x] Fix Dashboard Flicker (Company view showing Student view) <!-- id: 56 -->

- [ ] **Company Side Enhancements** <!-- id: 60 -->
    - [x] **Dashboard**: Group jobs, Add "Total Applications" view <!-- id: 61 -->
    - [x] **Job Posting**: Add Tags (Web/Mobile/AI), Qualifications, About Company <!-- id: 62 -->
    - [x] **Job Posting**: Configurable Question Counts (MCQ/Coding) <!-- id: 63 -->
    - [x] **Billing**: Add Transaction History & Back Button (Fixed Styles & Contrast) <!-- id: 64 -->
    - [x] **Applicants**: Hide Accept/Reject for pending assessments <!-- id: 65 -->

- [ ] **Student Side Enhancements** <!-- id: 70 -->
    - [x] **Dashboard**: Filter jobs by Company/Tags <!-- id: 71 -->
    - [x] **My Applications**: Separate Completed vs Pending <!-- id: 72 -->

- [ ] **Assessment Integrity & Calibration** <!-- id: 80 -->
    - [x] **Timer**: Implement Server-side Timer (Prevent reload reset) <!-- id: 81 -->
    - [x] **Proctoring**: Limit Tab Switches (Max 3) <!-- id: 82 -->
    - [x] **Calibration**: Tune difficulty (Added Pre-check & Lowered Threshold to 60%) <!-- id: 83 -->

- [ ] **Admin Side** <!-- id: 90 -->
    - [ ] Brainstorm features (Later) <!-- id: 91 -->
    - [x] Update Exam UI to fetch job-specific questions (Implemented Smart Selection Logic) <!-- id: 30 -->
    - [x] **Calibration Phase** <!-- id: 32 -->
        - [x] Create `CalibrationOverlay` component <!-- id: 33 -->
        - [x] Implement 9-point calibration logic <!-- id: 34 -->
        - [x] Implement Accuracy Calculation (WebGazer validation) <!-- id: 35 -->
        - [x] Gate Exam start behind 60% accuracy (User Verified) <!-- id: 36 -->
    - [x] **Final Polish & Fixes** <!-- id: 95 -->
        - [x] **Fix**: Coding Question not updating (Showing mock data) <!-- id: 96 -->
        - [x] **Feature**: Manual Question Entry (Company Side) <!-- id: 97 -->
        - [x] Verify end-to-end flow (Job Post -> AI Gen -> Student Exam) <!-- id: 31 -->

# Phase 5: MVP Hardening & Integrity (Current Priority)

- [ ] **Assessment Integrity** <!-- id: 100 -->
    - [ ] **Question Randomization**: Implement shuffling logic to select random subsets of questions per student <!-- id: 101 -->
    - [ ] **Copy-Paste Detection**: Add event listeners to flag suspicious clipboard activity <!-- id: 102 -->
    - [ ] **Server-Side Verify**: Capture and upload proctoring snapshots periodically for server-side persistence <!-- id: 103 -->

- [ ] **Advanced Assessment Engine** <!-- id: 110 -->
    - [ ] **Real Code Execution**: Ensure code editor sends payload to Backend -> Judge0 for actual validation <!-- id: 111 -->
    - [ ] **Result Parsing**: Parse Judge0 output to provide detailed pass/fail feedback per test case <!-- id: 112 -->
    - [ ] **Manual Question Entry**: Fully verify the "Manual Entry" flow for companies <!-- id: 113 -->

- [ ] **Analytics & Feedback** <!-- id: 120 -->
    - [ ] **Granular Scoring**: Calculate categorical scores (e.g., Logic vs Syntax) <!-- id: 121 -->
    - [ ] **Pre-Assessment**: Add "System Check" steps (Camera/Mic/Network) before exam starts <!-- id: 122 -->

- [ ] **Company Side Enhancements** <!-- id: 130 -->
    - [ ] **Billing Integration**: Charge credits on "Assessment Start" (or verify current logic) <!-- id: 131 -->
    - [ ] **Refund Logic**: Implement "Return Credit" if student doesn't start exam <!-- id: 132 -->

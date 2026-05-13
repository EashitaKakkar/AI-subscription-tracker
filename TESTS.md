# 🧪 Automated Test Suite

This suite validates the core mathematical logic of the **SpendLens Audit Engine** to ensure defensible financial recommendations.

### 📋 Test Coverage
*   **Filename:** `__tests__/audit.test.ts`
*   **Target:** Audit Engine Calculation Logic
*   **Total Tests:** 5 (Minimum Requirement)
*   **Key Scenarios:** 
    *   Validation of Cursor Pro annual savings ($48/seat/yr).
    *   Validation of Claude Team annual savings ($60/seat/yr).
    *   Verification of zero-savings for free tiers (Hobby/Free).
    *   Verification of zero-savings for already-optimal (Yearly) plans.
    *   Scalability check for team-based calculations (Team of 10).

### 🏃 How to Run
1.  **Install Test Environment:**
    ```bash
    npm install --save-dev jest jest-environment-jsdom ts-jest @types/jest
    ```
2.  **Execute Tests:**
    ```bash
    npm test
    ```
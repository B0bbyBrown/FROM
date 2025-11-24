# Expenses E2E

**Spec:** `cypress/e2e/expenses.cy.ts`  
**Primary Role:** `ADMIN`  
**Route Under Test:** `/expenses`

## Setup
- `beforeEach` logs in as `ADMIN`, visits `/expenses`, and waits for the page title.

## Test Cases

1. **`should display the expenses page`**  
   - Ensures `[data-testid="expenses-actions"]` and `[data-testid="add-expense-button"]` are visible.

2. **`should display expense summary cards`**  
   - Confirms `[data-testid="expense-summary-cards"]` plus `[data-testid="today-expenses"]`.

3. **`should allow creating a new expense`**  
   - Opens creation dialog via `add-expense-button`.
   - Fills label (`expense-label-input`), amount (`expense-amount-input`), and selects payment method through `[data-testid="payment-method-select"]`.
   - Intercepts `POST /api/expenses` as `@createExpense`.
   - Submits via `[data-testid="confirm-expense-button"]`.
   - **Success path:** Expect status 200, dialog disappears, “Test Expense” appears in `[data-testid="expenses-table"]`.  
   - **Error path:** For non-200, dialog remains open after short wait, indicating error handling.

4. **`should display expenses table`**  
   - If `[data-testid="expenses-table"]` exists, asserts visibility and—when rows exist—ensures the first `[data-testid^="expense-row-"]` renders.

## Planned Enhancements
- **Edit flow:** Open the first expense row in edit mode, change amount/label, and assert the PATCH payload plus inline row update.
- **Delete confirmation:** Trigger delete on an expense, confirm the modal, and cover both success removal and simulated 500 error states.
- **Validation surfacing:** Stub `POST /api/expenses` to return 422 so field-level validation messages are rendered without closing the dialog.
- **Filtering & pagination:** Apply category/date filters and paginate to ensure query params propagate to the API and the table updates accordingly.


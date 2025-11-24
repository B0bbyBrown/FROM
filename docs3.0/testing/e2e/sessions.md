# Cash Sessions E2E

**Spec:** `cypress/e2e/sessions.cy.ts`  
**Primary Role:** `CASHIER`  
**Route Under Test:** `/sessions`

## Setup
- `beforeEach` logs in as `CASHIER`, visits `/sessions`, and waits for “Cash Sessions”.

## Test Cases

1. **`should display the sessions page with no active session`**  
   - If `[data-testid="no-active-session"]` exists, asserts it is visible.  
   - Otherwise closes the active session (via dialogs filling `closing-float-input` and `close-item-*` fields) before asserting the no-session state.

2. **`should allow opening and closing a session`**  
   - Closes any existing session, then:
     - Clicks `open-session-button`, fills `opening-float-input` plus `item-*` inputs, confirms open, and expects `[data-testid="active-session-info"]`.  
   - Immediately closes the session using the close dialog, confirming `[data-testid="no-active-session"]`.

3. **`should display session history`**  
   - Ensures `[data-testid="sessions-table"]` is rendered.

4. **`should display session totals in table`**  
   - If rows exist (`[data-testid*="session-row-"]`), the first row must be visible; ensures totals list populates.

5. **`should show error for invalid opening float`**  
   - After guaranteeing no active session, opens the dialog, enters `-100` into `opening-float-input`, submits, and expects “Float must be positive”.

## Planned Enhancements
- **Concurrent session guard:** With an active session already open, attempt to open another and assert the UI blocks the action with a clear warning and no extra POST request.
- **Session timeout propagation:** Stub the session status endpoint to expire mid-use (especially from the Sales page) and confirm the UI forces a return to `/sessions` with guidance to reopen.
- **Partial reconciliation:** Close a session with mismatched counts to ensure discrepancy highlights/notes display and the backend receives variance data.


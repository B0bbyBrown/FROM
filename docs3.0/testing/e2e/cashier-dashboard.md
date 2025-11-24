# Cashier Dashboard E2E

**Spec:** `cypress/e2e/cashier-dashboard.cy.ts`  
**Primary Role:** `CASHIER`  
**Default Route Under Test:** `/dashboard`

## Setup
- `beforeEach` logs in via `cy.login("CASHIER")`.
- Navigates straight to `/dashboard`.
- Asserts that the dashboard heading is visible to confirm authentication succeeded.

## Test Cases

### 1. `should display cashier-specific dashboard`
- **Intent:** Ensure the cashier view shows either cashier-only context or at least the base dashboard widgets.
- **Flow:** After landing on the dashboard, reads the entire `<body>` contents.
- **Assertions:** Searches for cashier-specific text such as “Current Session”, “Session”, or “Cash”. Falls back to confirming “Dashboard” appears if cashier copy is absent (acts as a minimum guarantee).

### 2. `should show current session information if active`
- **Intent:** Validate the panel that surfaces active-vs-inactive cash sessions.
- **Flow:** Inspects the DOM for either `[data-testid="active-session-info"]` or `[data-testid="no-active-session"]`.
- **Assertions:** Whichever element exists must be visible, proving both “active” and “inactive” states render correctly.

### 3. `should allow navigation to sessions from dashboard`
- **Intent:** Confirm shortcut navigation from dashboard to cash sessions.
- **Flow:** Clicks `[data-testid="nav-link-cash-sessions"]`.
- **Assertions:** URL should include `/sessions`.

### 4. `should allow navigation to sales from dashboard`
- **Intent:** Verify direct navigation to the point-of-sale flow from the dashboard.
- **Flow:** Clicks `[data-testid="nav-link-point-of-sale"]`.
- **Assertions:** URL should include `/sales`.

## Planned Enhancements
- **Quick action error handling:** Stub the quick-sale bootstrap endpoint (or `/sales` preroute check) with a `403` to make sure the dashboard surfaces an error toast, keeps the cashier on the dashboard, and re-enables the CTA.
- **Session state awareness:** Start from a “no active session” seed and assert that the dashboard messaging pushes the cashier to open a session before POS navigation becomes available.


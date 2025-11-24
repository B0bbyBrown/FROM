# Logout Flow E2E

**Spec:** `cypress/e2e/logout.cy.ts`  
**Primary Role:** `ADMIN`  
**Routes Exercised:** `/dashboard`, `/login`

## Setup
- Each test logs in via `cy.login("ADMIN")` and navigates to `/dashboard`.
- Tests rely on a `[data-testid="logout-button"]` existing on authenticated routes.

## Test Cases

1. **`should logout and redirect to login`**  
   - Validates baseline behavior: from the dashboard, click logout, expect URL to include `/login` and the “Login” heading to appear.

2. **`should prevent access to protected routes after logout`**  
   - Confirms the dashboard fully loads (waits for URL, logout button, and “Dashboard” text).  
   - Logs out, then attempts to `cy.visit("/dashboard", { failOnStatusCode: false })`.  
   - Assertions ensure the URL falls back to `/login`, “Login” remains visible, and “Dashboard” no longer exists in the DOM.

3. **`should clear session data on logout`**  
   - After verifying `[data-testid="user-name"]` is present while authenticated, logs out.  
   - Ensures redirect to `/login`, confirms `user-name` no longer exists, and that “Dashboard” is absent—demonstrating client-side session/UI state resets.

## Planned Enhancements
- **Multi-tab logout propagation:** While remaining on the dashboard, manually clear auth storage via `cy.window()` (simulating another tab logging out) and assert the layout detects the change, hides protected nav, and redirects to `/login`.
- **Token invalidation retry:** Stub the logout API to fail (500) on first attempt and verify the UI surfaces the error and allows a retry that succeeds.


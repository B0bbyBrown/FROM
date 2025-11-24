# Login Page E2E

**Spec:** `cypress/e2e/login.cy.ts`  
**Roles Exercised:** Unauthenticated view leading to `ADMIN` dashboard on success  
**Route Under Test:** `/login`

## Setup
- `beforeEach` directly visits `/login` (no session established beforehand).

## Test Cases

1. **`should display the login form`**  
   - Confirms `#email`, `#password`, and the submit button (text “Log In”) exist.

2. **`should show an error message with invalid credentials`**  
   - Inputs bogus email/password, submits, and expects an “Invalid credentials” message (surface via toast or inline text).

3. **`should login successfully with valid credentials and redirect to dashboard`**  
   - Enters `admin@pizzatruck.com` / `password`.  
   - After submission, asserts the URL no longer includes `/login` and the “Dashboard” heading is visible, proving redirect on success.

## Planned Enhancements
- **Expired session recovery:** After landing on an authenticated route, intercept `/api/auth/me` with a `401` to ensure the shell surfaces a session-expired toast and sends the user back to `/login`.
- **Stale redirect guard:** While already authenticated, attempt to visit `/login` directly and assert the app immediately forwards the user to their role-specific default page without flashing the login form.


# Role-Based Access E2E

**Spec:** `cypress/e2e/role-based-access.cy.ts`  
**Roles Exercised:** `ADMIN`, `CASHIER`, `KITCHEN`, unauthenticated user  
**Routes Under Test:** `/login`, `/dashboard`, `/sessions`, `/kitchen`, `/users`, `/expenses`, `/reports`, `/purchases`, `/raw-materials`

## Test Cases

1. **`should redirect ADMIN to dashboard after login`**  
   - Manual form login as admin, expects `/dashboard` and heading.

2. **`should redirect CASHIER to sessions after login`**  
   - Manual login with cashier credentials, expects `/sessions` and “Cash Sessions”.

3. **`should redirect KITCHEN to kitchen after login`**  
   - Manual login with kitchen credentials, expects `/kitchen`.

4. **`should prevent CASHIER from accessing admin routes`**  
   - Uses `cy.login("CASHIER")`, then visits `/users`, `/expenses`, `/reports`.  
   - Each visit must redirect to `/dashboard` or `/sessions`.

5. **`should prevent KITCHEN from accessing non-kitchen routes`**  
   - Logs in as `KITCHEN`, attempts `/dashboard`, `/sales`, `/sessions`.  
   - All should bounce back to `/kitchen`.

6. **`should allow ADMIN to access all routes`**  
   - Logged in as admin, sequentially visits major routes and verifies URL includes each path.

7. **`should redirect unauthenticated users to login`**  
   - Clears cookies/local storage, hits `/dashboard` and `/reports`.  
   - Both should force `/login`.

8. **`should allow logout and redirect to login`**  
   - After admin login, clicks `[data-testid="logout-button"]`, expects `/login` and “Login” text.

## Planned Enhancements
- **Stale login redirect guard:** While authenticated as each role, attempt to visit `/login` directly and assert the app forwards to `/dashboard`, `/sessions`, or `/kitchen` respectively without rendering the login form.
- **Permission audit regression:** Downgrade a logged-in admin to cashier (via admin UI or API) and verify admin-only routes become inaccessible immediately, even before the user logs out.
- **Role change verification:** After editing a user’s role through the Users page, log in as that user to ensure their redirect and accessible routes reflect the new role.


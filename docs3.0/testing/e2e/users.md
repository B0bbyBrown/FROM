# User Management E2E

**Spec:** `cypress/e2e/users.cy.ts`  
**Primary Role:** `ADMIN`  
**Route Under Test:** `/users`

## Setup
- `beforeEach` logs in as `ADMIN`, visits `/users`, and waits for “User Management”.

## Test Cases

1. **`should display the users page`**  
   - Checks the create-user `<form>`, “Email”/“Password” labels, password input count, and the “Create User” submit button.

2. **`should display users table`**  
   - Ensures the table plus headers (“Name”, “Email”, “Role”) render.

3. **`should allow creating a new user`**  
   - Generates a timestamped email.  
   - Within the form: fills email, password, confirm password, and name fields.  
   - Opens role combobox, selects “Cashier”.  
   - Submits and waits briefly, then asserts the new email appears inside a table cell.

4. **`should show error for password mismatch`**  
   - Fills the form but uses different values for password vs. confirm password.  
   - After submission, asserts “Passwords do not match”.

5. **`should display edit and delete buttons for users`**  
   - If table rows exist, inspects the first row for at least one button (edit/delete actions).

## Planned Enhancements
- **Role change regression:** After updating an existing user’s role, log in as that user (via custom command) to confirm their redirect/access aligns with the new role.
- **Password complexity errors:** Stub `POST /api/users` to return a 422 for weak passwords and ensure the form surfaces the exact backend message while re-enabling the submit button.
- **Bulk import/export:** Trigger CSV export/import actions (if available), intercept the related endpoints, and verify toasts plus table updates reflect the result.


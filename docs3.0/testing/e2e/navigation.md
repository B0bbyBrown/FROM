# Navigation E2E

**Spec:** `cypress/e2e/navigation.cy.ts`  
**Primary Roles:** `ADMIN` (default), `CASHIER` for quick-sale test  
**Routes Exercised:** `/dashboard`, `/purchases`, `/raw-materials`, `/reports`, `/expenses`, `/users`, `/sales`

## Setup
- `beforeEach` logs in as `ADMIN`. Specific tests override the role as needed.

## Test Cases

1. **`should navigate between main pages`**  
   - Sequentially clicks sidebar nav links (`nav-link-purchases`, `nav-link-raw-materials`, etc.).  
   - After each click, asserts both URL path and page heading. Ends by returning to `/dashboard`.

2. **`should navigate using quick actions`**  
   - Re-authenticates as `CASHIER`, visits `/dashboard`, ensures `[data-testid="quick-sale-button"]` exists, then clicks it.  
   - URL must include `/sales`. Body text must contain either “Point of Sale” or “No Active Cash Session”; otherwise the URL check acts as fallback.

3. **`should navigate from KPI cards`**  
   - On `/dashboard`, clicks `[data-testid="kpi-revenue"]` (expects `/reports`), reloads dashboard, then clicks `[data-testid="kpi-margin"]` with the same expectation.

4. **`should maintain navigation state on page refresh`**  
   - Visits `/reports`, runs `cy.reload()`, and ensures both the URL and “Reports” heading persist—guarding against client-side routing breakage on refresh.

## Planned Enhancements
- **Shell resilience on 500s:** Intercept any navigation/menu config fetch with a `500` to confirm the layout shows fallback links (or skeleton) and a localized error message without crashing.
- **Quick action degradation:** Stub the quick-sale action to return a `403` and ensure the navigation module surfaces an error while leaving the user on the source page.
- **Auth guard re-entry:** While authenticated, hit `/login` or `/` repeatedly to assert the router consistently redirects to the correct role landing page (pairs with RBAC doc).


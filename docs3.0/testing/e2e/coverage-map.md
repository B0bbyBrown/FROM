# E2E Coverage Correlation Map

This reference ties each Cypress spec to the primary React surface (or server entry) it exercises so we can quickly confirm coverage and spot gaps. Paths reference the Vite client unless noted otherwise.

## Authentication & Shell

| Area | Source | Relevant Specs | Notes |
| --- | --- | --- | --- |
| Login form | `client/src/pages/Login.tsx` | `login`, `role-based-access`, `logout` | Validates form rendering, error feedback, and successful redirects. |
| Auth context & protected routing | `client/src/contexts/AuthContext.tsx`, `client/src/hooks/use-auth.ts` | `role-based-access`, `logout`, `navigation`, `not-found` | Specs repeatedly log in/out and hit guarded routes, verifying redirect logic implemented in `App.tsx` + layout. |
| Layout & navigation shell | `client/src/components/Layout.tsx` | `navigation`, `dashboard`, `cashier-dashboard`, `logout` | Coverage ensures sidebar links, quick actions, and KPI-card navigation work for different roles. |

## Dashboard Surfaces

| Route | Source | Specs | Coverage Highlights |
| --- | --- | --- | --- |
| `/dashboard` (admin) | `client/src/pages/dashboard.tsx` | `dashboard`, `navigation`, `logout`, `role-based-access` | KPI cards, activity feed, low stock, sales trend, and navigation interactions. |
| `/dashboard` (cashier variant) | `client/src/pages/dashboard.tsx` (role-gated blocks) | `cashier-dashboard`, `navigation` | Confirms cashier widgets, session info, and quick links. |

## Operations & Inventory

| Route | Source | Specs | Coverage Highlights |
| --- | --- | --- | --- |
| `/reports` | `client/src/pages/reports.tsx` | `reports`, `custom-date-range`, `navigation` | KPI cards, date-range select, product performance, inventory status, low-stock alerts. |
| `/expenses` | `client/src/pages/expenses.tsx` | `expenses`, `navigation`, `role-based-access` | Summary cards, create-expense dialog, optimistic failure handling. |
| `/purchases` | `client/src/pages/purchases.tsx` | `purchases`, `navigation`, `role-based-access` | Supplier selection (with add flow), line-item entry, table visibility. |
| `/raw-materials` | `client/src/pages/raw-materials.tsx` | `raw-materials`, `navigation` | Table headers, new-item dialog success/error, formatting checks. |
| `/users` | `client/src/pages/Users.tsx` | `users`, `role-based-access`, `navigation` | Form inputs, role select, password validation, CRUD action buttons. |

## Frontline Operations

| Route | Source | Specs | Coverage Highlights |
| --- | --- | --- | --- |
| `/sessions` | `client/src/pages/sessions.tsx` | `sessions`, `sales`, `role-based-access` | No-session state, open/close dialogs, validation errors, history table. |
| `/sales` | `client/src/pages/sales.tsx` | `sales`, `navigation`, `role-based-access` | Session prerequisite, add/remove line items, payment method, search, error toasts. |
| `/kitchen` | `client/src/pages/kitchen.tsx` | `kitchen`, `role-based-access` | Pending orders vs. empty state, status updates, item details, refresh heuristic. |
| `/help` | `client/src/pages/help.tsx` | `help` | Searchable accordion tasks, route hand-off to `/sales`. |

## System Resilience

| Area | Source | Specs | Notes |
| --- | --- | --- | --- |
| Protected-route fallback | `client/src/pages/not-found.tsx` + router | `not-found`, `role-based-access` | Invalid-route handling plus recovery links. |
| Logout/session clearing | `client/src/pages/dashboard.tsx` (header actions) | `logout`, `role-based-access` | Confirms `[data-testid="logout-button"]` clears UI state and blocks re-entry. |

## Observations / Next Checks
1. **Server-side mutations** exercised in `expenses`, `purchases`, `raw-materials`, and `sessions` rely on API routes defined in `server/routes.ts`; current tests hit the happy path plus minimal error handling.
2. **Data-testid alignment**: Every spec references IDs present in the corresponding page files above; no orphan selectors were found during review.
3. **Potential gaps**: No direct e2e coverage for `client/src/pages/help.tsx` task creation (read-only), `client/src/pages/expenses.tsx` edit/delete flows, or kitchen auto-refresh timing (only smoke-checked). These are candidates for future scaling work.


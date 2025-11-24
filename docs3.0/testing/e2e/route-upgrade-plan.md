# Route Upgrade Test Plan

This guide summarizes which enhanced E2E scenarios are immediately testable with the current UI/backend, and what work is required (UI + API/backend) to unlock the remaining tests listed in the spec briefs.

---

## Auth / Login / Logout

**Ready now**
- Added specs covering “redirect authenticated users away from `/login`” and “session expiry forces return to login” (`login.cy.ts`).
- Remote logout propagation handled by forcing `/api/auth/logout` and reloading (`logout.cy.ts`).

**Still needed**
- **Multi-tab auto-detect**: Implement a storage listener or periodic `/api/auth/me` polling that surfaces a toast when credentials disappear without any API call. Tests would hook into that broadcast instead of forcing a reload.
- **Token invalidation retry**: expose UI feedback (toast) on `POST /api/auth/logout` failures so Cypress can assert the retry path works.

---

## Dashboard (`/dashboard`)

**Current coverage**
- Base widgets, KPI navigation, low-stock interactions already tested.

**Needed for planned tests**
- **Trend empty state**: allow `/api/dashboard/overview` to return zeros with an explicit empty-state component that Cypress can assert.
- **Activity pagination**: implement paged/infinite scroll API (`GET /api/reports/activity?cursor=`) and UI controls; expose `data-testid` around “Load more” button.
- **Quick action degradation**: when quick-sale bootstrap fails (e.g., `/api/sessions/active` 403), show toast and keep CTA enabled so tests can check error handling.

Backend: add pagination to activity endpoint and ensure overview endpoint accepts query params for different seed data sets.

---

## Reports (`/reports`)

**Implemented**
- Preset switching retains custom inputs (new spec in `reports.cy.ts`).

**Needed**
- **Invalid date validation**: add client-side checks (e.g., disable export/apply if `from > to` or malformed) and surface error messages. Provide `data-testid` for error labels so tests can assert them; block `GET /api/reports/*` calls when invalid.
- **Latency skeletons**: ensure KPI cards expose skeleton elements (with test IDs) that stay mounted until queries resolve.
- **Export trigger**: wire the “Export Report” button to an endpoint (e.g., `POST /api/reports/export`) and display success/error toasts so Cypress can intercept the request and verify filters were sent.

Backend: create export endpoint and make metric requests accept date parameters (instead of calculating entirely client-side) so intercepting/validating calls is meaningful.

---

## Expenses (`/expenses`)

**Current**
- Creation flow with optimistic error path covered.

**Required for new tests**
- **Edit & delete**: add UI actions per row, dialogs/forms, and `PATCH /api/expenses/:id`, `DELETE /api/expenses/:id` endpoints returning structured errors.
- **Validation surfacing**: backend should respond with `422` field errors; UI must map them to inputs (ideally using `data-testid="expense-error-label"` etc.).
- **Filtering/pagination**: implement filter controls (date range, category) that update query params; backend must support `GET /api/expenses?from&to&category&page=` and return pagination metadata so Cypress can assert network requests.

---

## Purchases (`/purchases`)

**Current**
- Single line-item creation with supplier add flow.

**Needed**
- **Multiple line items**: UI “Add line item” control plus summary totals; backend must accept arrays of items (already part of schema) but UI should expose derived total so tests can assert it.
- **Supplier inline edit**: add edit buttons and `PATCH /api/suppliers/:id`; return updated supplier info to dialog.
- **Network retry**: surface failure banner with retry button that simply resubmits the cached payload; Cypress can stub 500 then 200.

---

## Raw Materials (`/raw-materials`)

**Current**
- Create flow tested; table existence asserted.

**Needed**
- **Duplicate SKU**: backend must send a unique constraint error with identifiable code; UI surfaces inline error next to SKU input.
- **Inline threshold edits**: add per-row editable cell (or action menu) plus `PATCH /api/raw-materials/:id`.
- **Search/filter controls**: add search input + type filter, pass params to `GET /api/raw-materials?query=&type=`, include empty-state messaging with test IDs.

---

## Sessions (`/sessions`)

**Current**
- Opening/closing, validation for negative floats.

**Needed**
- **Concurrent session guard**: backend should reject `POST /api/sessions/open` if another session is active (with a distinct 409 code); UI must surface warning toast.
- **Timeout propagation**: when `/api/sessions/active` returns 404 while cashier is on `/sales`, force redirect back to `/sessions` with guidance.
- **Partial reconciliation**: closing dialog should display variance columns and send discrepancy values to backend; tests can assert on visible markers.

Backend: enforce single active session invariant and return structured errors for Cypress to match.

---

## Sales / POS (`/sales`)

**Current**
- Add/remove items, basic validation, create sale success/failure message checked.

**Needed**
- **Discounts/notes**: add UI fields and persist them in sale payload; recent sales table should show note/discount badges for assertions.
- **Offline/failed payment recovery**: show toast plus leave cart intact when `POST /api/sales` fails; add retry button or allow re-clicking “Complete Sale”.
- **Session timeout**: integrate with session guard described above so POS blocks checkout when backend reports expired session.

Backend: extend sale schema to include optional note/discount; return descriptive errors for network failures (or allow client to detect `forceNetworkError` gracefully).

---

## Kitchen (`/kitchen`)

**Current**
- Pending orders display, status updates via “Prep” button.

**Needed**
- **Batch completion**: UI multi-select or bulk action; backend endpoint (e.g., `POST /api/kitchen/orders/batch-update`) to update statuses atomically.
- **Conflict handling**: propagate backend 409 (already completed) responses up to UI toast and refresh orders list so tests can intercept.
- **Auto-refresh verification**: ensure polling uses consistent interval and deduplicates; expose `data-testid` on refresh indicator to assert with `cy.clock`.

---

## Help (`/help`)

**Current**
- Task search, single “Process Sale” navigation.

**Needed**
- **Deep links**: ensure task metadata includes destination route, and CTA uses router push so tests can iterate through each.
- **Search empty-state**: implement explicit message container to assert when no tasks match.
- **Rich content**: if markdown or media is expected, provide deterministic selectors that Cypress can target.

Backend: tasks currently static, so enhancements are all UI-side.

---

## Users (`/users`)

**Current**
- Creation, table presence, password mismatch validation.

**Needed**
- **Role change regression**: UI should support editing roles (e.g., action menu). After save, backend should invalidate sessions or at least next login; we can then log in as the edited user and assert landing page.
- **Password complexity errors**: backend must return 422 with specific messages; UI needs to display them inline.
- **Bulk import/export**: wire UI buttons to CSV endpoints and show toasts/processing states.

Backend: add PATCH `/api/users/:id`, import/export APIs, and improved password validation responses.

---

## Navigation Shell

**Current**
- Sidebar links tested for basic routing; quick-sale button covered in POS specs.

**Needed**
- **Config fetch resilience**: if shell ever loads menu config from `/api/navigation`, handle 500s with fallback set so Cypress can intercept.
- **Global error boundary**: when any protected route returns 401/403, show consistent toast + redirect so tests can assert cross-route behavior.

---

With these UI/API updates in place, each planned test scenario from the spec briefs becomes actionable and easy to automate via Cypress. Let me know which route you’d like prioritized for implementation.***


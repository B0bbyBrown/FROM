# Scaled E2E Test Plan

This roadmap outlines the next wave of end-to-end coverage. Each section calls out the current spec(s), new scenarios to add, and the primary UI/server touchpoints they exercise. Use this as the source of truth before implementing new Cypress tests.

---

## 1. Authentication, Layout, and Routing

- **Specs to extend:** `login`, `logout`, `role-based-access`, `navigation`, `not-found`
- **New scenarios**
  1. **Expired session recovery** – simulate `/api/auth/me` returning 401 mid-test (force via `cy.intercept`) and assert the UI shows a toast plus redirects to `/login`.
  2. **Multi-tab logout propagation** – log in, manually clear storage via `cy.window()` to mimic another tab logging out, verify the layout reacts by hiding protected nav links.
  3. **Stale redirect guard** – attempt to open `/login` while already authenticated; ensure user is bounced to their role default (dashboard/sessions/kitchen).
  4. **Graceful 500 on navigation shell** – intercept any menu fetch (if applicable) with 500, confirm fallback menu still renders.

---

## 2. Dashboard Surfaces

- **Specs to extend:** `dashboard`, `cashier-dashboard`
- **New scenarios**
  1. **Trend data variability** – mock `/api/dashboard/trends` with zero values to ensure KPIs show “0” and charts render empty states.
  2. **Activity feed pagination** – trigger “Load more” (if available) or simulate long lists to ensure virtualized scroll behaves.
  3. **Cashier quick action errors** – intercept navigation CTA API (e.g., quick sale) with 403 to confirm error banners appear.

---

## 3. Reports & Date Range

- **Specs to extend:** `reports`, `custom-date-range`
- **New scenarios**
  1. **Invalid date submission** – type malformed dates, ensure validation prevents API call and highlights inputs.
  2. **Server latency fallback** – delay metrics API (e.g., `/api/reports/metrics`) to ensure skeleton loaders persist and Cypress waits for completion.
  3. **Export functionality** – if export button exists, trigger it and confirm network call + file download toast.

---

## 4. Expenses

- **Specs to extend:** `expenses`
- **New scenarios**
  1. **Edit expense flow** – open first expense row, modify amount, assert optimistic UI update and backend request.
  2. **Delete expense confirmation** – ensure delete modal appears, handles success/error states.
  3. **API validation errors** – POST that returns 422 (missing label) to ensure field-level errors display.
  4. **Pagination / filtering** – if filters exist, verify they update table queries.

---

## 5. Purchases

- **Specs to extend:** `purchases`
- **New scenarios**
  1. **Multiple line items** – add two materials with different cost/qty, assert totals in review summary.
  2. **Supplier edit inline** – if detail panel editable, cover editing contact info.
  3. **Network failure & retry** – intercept POST with 500 first, verify retry button replays request successfully.

---

## 6. Raw Materials

- **Specs to extend:** `raw-materials`
- **New scenarios**
  1. **Duplicate SKU handling** – attempt to create existing SKU, expect backend 409 and inline error.
  2. **Inline edit / reorder thresholds** – adjust low-stock level directly in table if supported.
  3. **Search & filters** – verify search input filters rows and no-results state appears.

---

## 7. Sessions & Sales

- **Specs to extend:** `sessions`, `sales`
- **New scenarios**
  1. **Concurrent session guard** – try to open a second session while one is active; expect warning and blocked action.
  2. **Session timeout** – simulate backend expiring session mid-sale, ensuring UI forces close or prompts re-open.
  3. **Partial cash reconciliation** – close session with mismatched counts to ensure discrepancies are highlighted.
  4. **Sales discounts/notes** – if UI supports discounts or notes, add assertions for totals and persisted metadata.
  5. **Offline/failed payment** – intercept sale POST with network error, ensure items remain in cart and toast displays.

---

## 8. Kitchen Operations

- **Specs to extend:** `kitchen`
- **New scenarios**
  1. **Batch order completion** – select multiple orders (if UI allows) and mark complete, verifying each status updates.
  2. **Conflict resolution** – simulate backend rejecting status change (already completed) to confirm UI retries or displays conflict message.
  3. **Auto-refresh verification** – stub timer to assert orders reload every 5s without duplicating cards.

---

## 9. Help & Knowledge Base

- **Specs to extend:** `help`
- **New scenarios**
  1. **Task deep links** – ensure each accordion entry navigates to the correct route, not just “Process Sale”.
  2. **Search empty state** – search for nonsense string, expect “No tasks found” messaging.
  3. **Task descriptions** – expand accordions to verify Markdown formatting or media (if present).

---

## 10. Users / RBAC Admin

- **Specs to extend:** `users`, `role-based-access`
- **New scenarios**
  1. **Role change regression** – edit an existing user to another role and ensure they inherit the right redirect on next login (simulate by hitting auth API as that user).
  2. **Password complexity errors** – backend 422 for weak passwords; verify error text.
  3. **Bulk user import/export** – if CSV tools exist, trigger and validate network calls.
  4. **Permission audit** – attempt to access admin routes with newly downgraded account to ensure revocation takes effect immediately.

---

## Implementation Notes

1. **API intercept helpers** – add utility helpers in `cypress/support/commands.ts` for common intercept patterns (e.g., `cy.mockAuth(state)`).
2. **Seed data control** – consider dedicated seed scripts per suite so scenarios start from predictable inventories/sessions.
3. **Artifacts & tagging** – tag new tests (e.g., `@critical`, `@negative`) to enable focused CI runs.
4. **Documentation** – when implementing, update each existing doc in `docs3.0/testing/e2e/*.md` with the new `it(...)` descriptions for traceability.


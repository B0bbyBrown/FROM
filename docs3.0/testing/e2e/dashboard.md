# Dashboard E2E

**Spec:** `cypress/e2e/dashboard.cy.ts`  
**Primary Role:** `ADMIN`  
**Routes Under Test:** `/` (alias of `/dashboard`), `/reports`, `/purchases`

## Setup
- `beforeEach` logs in as `ADMIN`, visits `/`, and waits for the “Dashboard” heading.
- All tests assume KPI cards, activity feed, and low-stock widgets are seeded with data but handle empty states defensively.

## Test Cases

1. **`should display the main KPI cards`**  
   - Confirms `[data-testid="today-revenue"]` and `[data-testid="gross-margin"]` are rendered.

2. **`should display the "Top Products Today" section`**  
   - Checks `[data-testid="top-products-card"]`.

3. **`should display the "Recent Activity" feed`**  
   - Ensures `[data-testid="recent-activity-card"]` is visible.

4. **`should display the "Low Stock Alert" card`**  
   - Verifies `[data-testid="low-stock-card"]`.

5. **`should display the "Sales Trend" chart`**  
   - Confirms `[data-testid="sales-chart-card"]`.

6. **`should navigate from KPI card click`**  
   - Clicks `[data-testid="kpi-revenue"]`, expects pathname `/reports`.

7. **`should navigate to purchases from low stock alert`**  
   - If `[data-testid="create-purchase-order"]` exists, clicking it must route to `/purchases`. Otherwise, asserts `[data-testid="low-stock-list"]` contains “well stocked”.

8. **`should show no activity message with empty feed`**  
   - Smoke test that `[data-testid="recent-activity-card"]` renders even when no entries exist.

9. **`should filter activity by sales`**  
   - Taps `[data-testid="filter-sales-button"]`, ensures the button loses the outline class and `[data-testid="activity-list"]` remains visible.

10. **`should filter activity to show all`**  
    - Similar to above but for `[data-testid="filter-all-activity-button"]`.

## Planned Enhancements
- **Trend empty-state validation:** Intercept dashboard metrics to return zeros/empty arrays and assert KPI cards and charts render “0” values with proper empty-state copy instead of blanks.
- **Activity feed pagination:** Seed or stub multiple pages of activity, trigger “Load more” (or infinite scroll) and verify entries append without duplicates while filter state persists.
- **Widget error resilience:** Force a 500 from a secondary widget (e.g., low stock) to ensure the dashboard shows a localized error banner without affecting the rest of the layout.


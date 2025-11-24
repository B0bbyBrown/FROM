# Reports Page E2E

**Spec:** `cypress/e2e/reports.cy.ts`  
**Primary Role:** `ADMIN`  
**Route Under Test:** `/reports`

## Setup
- `beforeEach` logs in as `ADMIN`, visits `/reports`, and verifies the heading.

## Test Cases

1. **`should display period metrics`**  
   - Confirms `[data-testid="period-revenue"]` and `[data-testid="period-margin"]`.

2. **`should change date range`**  
   - Opens the date range Radix `Select` within `[data-testid="date-range-filter-card"]`, picks “This Week”, and ensures the KPI metrics stay visible post-change.

3. **`should display top products`**  
   - Checks `[data-testid="product-performance-card"]`.

4. **`should display low stock items`**  
   - Always asserts `[data-testid="inventory-status-card"]`.  
   - If `[data-testid="low-stock-alerts"]` exists, it must be visible; otherwise, the fallback card suffices.

5. **`should display stock movements`**  
   - When `[data-testid="ingredient-usage-table"]` exists, ensures it is visible.

6. **`should display current stock levels`**  
   - Simple guard that `[data-testid="inventory-status-card"]` renders (covers “current stock” summary).

## Planned Enhancements
- **Invalid date submission:** While in “Custom Range”, enter malformed or reversed dates and assert validation prevents the metrics request plus highlights the offending inputs.
- **Latency skeleton persistence:** Intercept `/api/reports/metrics` with a multi-second delay to verify skeleton loaders remain visible until data arrives, then disappear once KPIs render.
- **Export trigger:** Click the export control, ensure the request includes the active filters, and check that a toast/download indicator appears upon completion (cover both success and simulated failure).


# Purchases Page E2E

**Spec:** `cypress/e2e/purchases.cy.ts`  
**Primary Role:** `ADMIN`  
**Route Under Test:** `/purchases`

## Setup
- `beforeEach` logs in as `ADMIN`, navigates to `/purchases`, and asserts the heading is present.

## Test Cases

1. **`should display the purchases page and past purchases`**  
   - Verifies `[data-testid="purchases-table"]` renders.

2. **`should allow creating a new purchase`**  
   - Opens `[data-testid="create-purchase-dialog"]` via `create-purchase-button`.  
   - Handles two supplier states:
     - **No suppliers:** only “Add New Supplier” option exists; opens nested dialog, creates “Test Supplier”, then selects it.
     - **Existing suppliers:** selects the first non-“Add New Supplier” option.  
   - Adds line item through `[data-testid="item-select-0"]`, filling quantity (`quantity-input-0`) and cost (`cost-input-0`).  
   - Confirms via `[data-testid="confirm-purchase-button"]`, waits, and expects the table to refresh (still visible) after the dialog closes.

## Planned Enhancements
- **Multiple line items:** Add at least two materials in a single purchase and assert subtotal/total calculations plus payload structure.
- **Supplier inline edit:** From within the purchase dialog, edit supplier details (if supported) and ensure the supplier PATCH request completes before submission.
- **Network retry:** Force the first `POST /api/purchases` call to fail (500) and confirm the UI surfaces a retry option that resubmits the same payload successfully.


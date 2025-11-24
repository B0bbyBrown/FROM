# Sales (Point of Sale) E2E

**Spec:** `cypress/e2e/sales.cy.ts`  
**Primary Role:** `CASHIER`  
**Routes Under Test:** `/sessions`, `/sales`

## Setup
- `beforeEach` logs in as `CASHIER`, visits `/sessions`, and waits for “Cash Sessions”.
- Determines session state:
  - If `[data-testid="close-session-button"]` exists, reuses the active session.
  - If `[data-testid="open-session-button"]` or “Open Session” button exists, opens a session by entering opening float and inventory counts.
- After ensuring a session, navigates to `/sales` and confirms “Point of Sale” (or equivalent) is visible.

## Test Cases

1. **`should display the sales page and product list`**  
   - Checks `[data-testid="products-list"]` and `[data-testid="complete-sale-button"]`.

2. **`should allow creating a new sale`**  
   - Adds the first available product via `[data-testid*="add-product"]`.  
   - Shows `[data-testid="sale-items-list"]`, selects payment method “Cash”, and clicks `complete-sale-button`.  
   - Waits and ensures `[data-testid="recent-sales-table"]` renders, indicating persistence.

3. **`should search for products`**  
   - Types “pep” into `[data-testid="product-search-input"]`, expects “Pepperoni” to remain visible.

4. **`should update item quantity in sale`**  
   - Adds a product, clicks `[data-testid*="increase-qty"]`, expects quantity text to change from “1”, then decrements once.

5. **`should remove item from sale`**  
   - Adds a product, clicks `[data-testid*="remove-item"]`, ensures `[data-testid="sale-items-list"]` lacks the product text (e.g., no “Pizza”).

6. **`should show error when completing sale with no items`**  
   - Ensures sale list is empty (removes existing items if any).  
   - Clicks `complete-sale-button` (forced).  
   - Waits for toast containing “Please add items to the sale”.

## Planned Enhancements
- **Session timeout handling:** While mid-sale, stub the session validation endpoint to return `404` so the POS blocks checkout and routes the cashier back to `/sessions` to reopen.
- **Discounts & notes:** Apply percentage/fixed discounts plus customer notes, then complete the sale to ensure totals reflect the discount and the note persists in the recent sales table.
- **Offline/failed payment recovery:** Force the first sale submission to `forceNetworkError` and confirm cart contents remain with a retry path that succeeds on the second attempt.


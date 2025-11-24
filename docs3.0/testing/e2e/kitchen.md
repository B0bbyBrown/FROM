# Kitchen Page E2E

**Spec:** `cypress/e2e/kitchen.cy.ts`  
**Primary Role:** `KITCHEN`  
**Route Under Test:** `/kitchen`

## Setup
- `beforeEach` logs in with the `KITCHEN` role, visits `/kitchen`, and confirms the heading is visible.

## Test Cases

1. **`should display the kitchen page`**  
   - Verifies the main heading and subtitle “Manage order preparation”.

2. **`should display pending orders`**  
   - Reads the `<body>` to detect “No pending orders”.  
   - If present, asserts that message. Otherwise, expects a grid of order cards (`div[class*="grid"]`).

3. **`should allow updating order status`**  
   - Searches for cards with “Order #” copy or buttons.  
   - Clicks the first “Prep” button when available, waits briefly, and validates a success indicator (“Status updated” text) appears anywhere in the body.

4. **`should display order details`**  
   - If orders exist (i.e., the page does not show “No pending orders”), ensures at least one line item with quantity (identified by text containing “x”) is rendered.

5. **`should auto-refresh orders`**  
   - Basic health check confirming the page header loads, indirectly indicating the 5-second auto-refresh loop does not break initial rendering.

## Planned Enhancements
- **Batch completion:** Select multiple orders (if supported) and confirm bulk “Mark Completed” actions update every card and fire the correct API payload.
- **Conflict handling:** Stub the status update request with a `409` to ensure the UI surfaces a conflict message and refreshes the order state.
- **Auto-refresh verification:** Use `cy.clock`/`cy.tick` while intercepting the orders endpoint to prove polling swaps in new data without duplicating cards.


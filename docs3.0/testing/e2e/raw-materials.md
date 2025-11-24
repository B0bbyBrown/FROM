# Raw Materials E2E

**Spec:** `cypress/e2e/raw-materials.cy.ts`  
**Primary Role:** `ADMIN`  
**Route Under Test:** `/raw-materials`

## Setup
- `beforeEach` logs in as `ADMIN`, visits `/raw-materials`, and confirms the page heading.

## Test Cases

1. **`should display the raw materials page`**  
   - Confirms heading plus a visible `<table>`.

2. **`should display raw materials table`**  
   - Verifies table headers for “Name”, “SKU”, “Type”, “Unit”, and “Price”.

3. **`should allow creating a new raw material`**  
   - Opens the “Create New Item” dialog, fills inputs (`#name`, `#unit`, `#sku`, `#lowStockLevel`).  
   - Intercepts `POST /api/raw-materials` as `@createItem`.  
   - Submits via “Create Item”.  
   - **Success (200):** dialog disappears and “Test Material” shows up in the table.  
   - **Failure:** expects “Failed to create item” while the dialog stays open.

4. **`should display raw materials with correct formatting`**  
   - When rows exist, ensures the first row contains at least three data cells.

5. **`should show price in correct currency format`**  
   - If table rows exist, checks the body text for either “R” or a numeric pattern matching currency (e.g., `12.34`).

## Planned Enhancements
- **Duplicate SKU handling:** Attempt to create a material with an existing SKU while stubbing the backend to return `409`, ensuring the dialog surfaces a clear error and stays open for correction.
- **Inline threshold edits:** Modify the low-stock threshold directly from the table (or via edit modal) and assert the PATCH request updates the row without a full reload.
- **Search and filters:** Exercise the search bar/type filters, confirming the API receives the query params and that an explicit empty-state message appears when no materials match.


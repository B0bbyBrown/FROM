# Component Audit Log - Pages That Need Work

## 📋 Dashboard (`/dashboard`)

### Issues Found:
1. **Recent Activity Filter Buttons** (Lines 468-473)
   - "Sales" and "All Activity" buttons are non-functional
   - No state management or filtering logic
   - Need to implement actual filtering functionality

2. **Sales Trend Chart** (Lines 545-627)
   - Chart data calculation may be incorrect (using `getOverview` instead of `getSales`)
   - Y-axis formatter removes currency symbol incorrectly (line 606)
   - Missing proper date range handling

3. **Cashier Dashboard** (Lines 632-664)
   - Incomplete implementation - placeholder comment on line 633
   - "Current Session" card is empty (line 659)
   - Missing actual session data fetching and display

4. **Yesterday Comparison Logic** (Lines 71-99)
   - Uses `getOverview` instead of `getSales` for yesterday data
   - May cause incorrect percentage calculations

---

## 💰 Sales Page (`/sales`)

### Issues Found:
1. **No Session Warning** (Lines 233-248)
   - Warning shows even when there's an active session check above
   - Logic conflict: checks for activeSession but still shows warning

2. **Recent Sales Table** (Lines 437-508)
   - No pagination for large datasets
   - Limited to 10 items with no "View More" option
   - Missing sale item details view

3. **Product Search** (Lines 255-260)
   - Search is case-sensitive
   - No debouncing for performance
   - Could benefit from fuzzy search

4. **Sale Completion** (Lines 195-215)
   - No confirmation dialog for large orders
   - Missing receipt printing functionality
   - No option to save as draft

---

## 💵 Sessions Page (`/sessions`)

### Issues Found:
1. **Complex Query Management** (Lines 64-134)
   - Uses `refreshKey` workaround for query invalidation
   - Overly complex optimistic updates
   - Could be simplified with better query key management

2. **Inventory Snapshot Input** (Lines 541-566, 694-719)
   - No validation for minimum/maximum quantities
   - No auto-fill from current stock levels
   - Missing bulk entry functionality

3. **Session History Table** (Lines 764-838)
   - No filtering or sorting options
   - Missing export functionality
   - No detailed view for individual sessions

4. **Variance Calculation** (Lines 356-364)
   - Only shows variance when closing float is entered
   - Could show real-time variance during session

---

## 📊 Reports Page (`/reports`)

### Issues Found:
1. **Date Range Filter** (Lines 94-97)
   - `getOverview()` doesn't use date range parameters
   - Date range selection doesn't affect overview data
   - Need to pass date range to API call

2. **Export Report Button** (Line 274)
   - Non-functional - no implementation
   - Missing export functionality (CSV/PDF)

3. **Sales Trend Chart** (Lines 597-617)
   - Placeholder only - no actual chart implementation
   - Missing visualization of sales data

4. **Ingredient Usage** (Lines 171-196)
   - Uses `ingredientId` but should use `itemId` (field name mismatch)
   - May cause incorrect data display
   - Missing unit conversion handling

5. **Stock Movements Field Names** (Lines 179-190)
   - Uses `movement.ingredientId` but API likely returns `itemId`
   - Field name inconsistency

---

## 🍕 Kitchen Page (`/kitchen`)

### Issues Found:
1. **Order Card Status Logic** (Line 108)
   - Potential crash if `order.items[0]` is undefined
   - Should check if items array has elements before accessing

2. **Missing Order Details**
   - No way to view full order details
   - No customer information display
   - Missing order notes/comments

3. **Status Update** (Lines 95-99)
   - No confirmation for status changes
   - Missing undo functionality
   - No bulk status update

4. **Animation Performance** (Lines 54-60)
   - May cause performance issues with many orders
   - Consider virtualization for large lists

---

## 🛒 Purchases Page (`/purchases`)

### Issues Found:
1. **Purchase Details View** (Line 532-538)
   - "View Purchase" button is non-functional
   - Missing dialog/modal to show purchase details
   - No way to see individual purchase items

2. **Supplier Selection** (Lines 243-264)
   - "Add New Supplier" opens dialog but doesn't close purchase dialog
   - UX flow could be improved

3. **Purchase Item Validation** (Lines 137-149)
   - No validation for duplicate items
   - Missing unit cost calculation validation
   - No check for negative quantities

4. **Purchase History** (Lines 490-544)
   - No filtering by supplier or date range
   - Missing total cost column
   - No edit/delete functionality

---

## 💸 Expenses Page (`/expenses`)

### Issues Found:
1. **Category Detection** (Lines 404-415)
   - Hardcoded category logic based on label text
   - Should have proper category field in database
   - Missing category management

2. **Expense Table** (Lines 355-421)
   - No filtering or sorting
   - Missing edit/delete functionality
   - No date range filtering

3. **Expense Form** (Lines 163-235)
   - No category selection
   - Missing receipt upload
   - No recurring expense option

4. **Summary Cards** (Lines 240-334)
   - "Total Expenses" shows all-time, not period-based
   - Missing period comparison
   - No expense trends

---

## 📦 Raw Materials Page (`/raw-materials`)

### Issues Found:
1. **Price Display** (Line 105)
   - Hardcoded dollar sign instead of using `formatCurrency`
   - Currency inconsistency

2. **Table Functionality** (Lines 84-111)
   - No edit/delete functionality
   - Missing stock level display
   - No filtering or sorting

3. **Recipe Management** (Lines 212-251)
   - No validation for circular dependencies
   - Missing recipe visualization
   - No way to copy/clone recipes

4. **Item Form** (Lines 116-260)
   - No form validation
   - Missing SKU auto-generation
   - No duplicate name checking

---

## 👥 Users Page (`/users`)

### Issues Found:
1. **Missing Imports** (Line 43)
   - `queryClient` is used but not imported
   - Will cause runtime error

2. **Edit/Delete Functionality** (Lines 126-131)
   - Buttons are present but non-functional
   - No edit dialog implementation
   - No delete confirmation

3. **Form Validation** (Lines 54-65)
   - Basic password match check only
   - Missing email validation
   - No password strength requirements

4. **User Table** (Lines 110-136)
   - No role filtering
   - Missing user activity/status
   - No last login display

---

## ❓ Help Page (`/help`)

### Issues Found:
1. **Outdated Context Usage** (Line 207)
   - Uses old `AuthContext` instead of `useAuth` hook
   - May cause errors if context is not available

2. **Missing Screenshots** (Lines 55, 72, 84, etc.)
   - All screenshot paths are placeholders
   - Images won't load

3. **Route Mismatches** (Lines 187-203)
   - References `/products` and `/inventory` routes that may not exist
   - Should use actual route names (`/raw-materials`)

4. **Task Data** (Lines 40-182)
   - Some tasks reference non-existent pages
   - Logic descriptions may be outdated

---

## 🔐 Login Page (`/login`)

### Issues Found:
1. **Context Usage** (Line 20)
   - Uses old `AuthContext` instead of `useAuth` hook
   - Inconsistent with rest of app

2. **Error Handling** (Lines 38-45)
   - Generic error message
   - Doesn't distinguish between network errors and auth failures

3. **Form Validation** (Lines 48-51)
   - No client-side validation
   - Missing "Remember Me" option
   - No password reset link

---

## 🎯 Summary of Critical Issues

### High Priority:
1. **Users Page** - Missing `queryClient` import (will crash)
2. **Help Page** - Using deprecated AuthContext
3. **Login Page** - Using deprecated AuthContext
4. **Reports Page** - Date range not being passed to API
5. **Raw Materials** - Hardcoded dollar sign

### Medium Priority:
1. **Dashboard** - Non-functional filter buttons
2. **Sessions** - Complex query management needs simplification
3. **Purchases** - Missing purchase details view
4. **Expenses** - Hardcoded category logic
5. **Kitchen** - Potential crash with empty items array

### Low Priority:
1. **Sales** - Missing pagination
2. **Reports** - Missing export functionality
3. **All Pages** - Missing loading skeletons
4. **All Pages** - Missing error boundaries

---

## 🔧 Recommended Fixes

1. **Standardize Auth** - Replace all `AuthContext` with `useAuth` hook
2. **Add Error Boundaries** - Wrap all pages in error boundaries
3. **Implement Missing Features** - Export, filtering, sorting
4. **Fix Currency** - Use `formatCurrency` everywhere
5. **Add Validations** - Form validations and error messages
6. **Improve UX** - Loading states, confirmations, undo actions


# Custom Date Range (Reports) E2E

**Spec:** `cypress/e2e/custom-date-range.cy.ts`  
**Primary Role:** `ADMIN`  
**Route Under Test:** `/reports`

## Setup
- `beforeEach` logs in as `ADMIN`, visits `/reports`, and confirms the “Reports” heading is visible.
- All tests assume the date-range filter card exists and that Radix `Select` components render the combobox trigger buttons.

## Test Cases

### 1. `should allow selecting custom date range`
- **Intent:** Confirm the UI exposes a “Custom Range” option and reveals the date inputs.
- **Flow:** Within `[data-testid="date-range-filter-card"]`, clicks the first `button[role="combobox"]`, then selects the “Custom Range” option.
- **Assertions:** Both `[data-testid="from-date-input"]` and `[data-testid="to-date-input"]` must appear.

### 2. `should allow setting custom from and to dates`
- **Intent:** Validate manual date entry updates the report metrics.
- **Flow:** Repeats the steps to choose “Custom Range”, calculates “7 days ago” and “today”, then types ISO `YYYY-MM-DD` strings into the from/to inputs.
- **Assertions:** Inputs must hold the typed values and `[data-testid="period-revenue"]` stays visible as proof the report recalculated.

### 3. `should validate date range (to date after from date)`
- **Intent:** Capture the UX when users set an invalid range (end date before start).
- **Flow:** Selects “Custom Range”, sets “from” to today and “to” to yesterday.
- **Assertions:** Confirms the inputs accept both values. (Any validation feedback is implicit; the test ensures the scenario is representable in Cypress.)

## Planned Enhancements
- **Strict date validation:** Attempt to submit malformed dates (e.g., `2025/02/30`) or a reversed range while spying on the metrics request to ensure no API call fires and inline validation messages appear.
- **Preset persistence:** Switch between presets and custom ranges multiple times to confirm selected values persist when reopening the dialog.


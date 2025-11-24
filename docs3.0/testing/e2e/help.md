# Help Page E2E

**Spec:** `cypress/e2e/help.cy.ts`  
**Primary Role:** `CASHIER`  
**Route Under Test:** `/help`

## Setup
- `beforeEach` logs in as `CASHIER`.
- Intercepts `GET /api/auth/me` as `@getMe` to ensure user context loads.
- Visits `/help` and waits for `@getMe` to complete.

## Test Cases

1. **`should display the help page with search and task cards`**  
   - Asserts “Quick Task Helper”, the search input (`placeholder="Search tasks..."`), and at least one `[data-testid^="task-accordion-"]`.

2. **`should filter tasks when searching`**  
   - Types “sale” into the search input.  
   - Expects only one accordion to remain and confirms `[data-testid="task-accordion-process-sale"]` contains “Process a Sale”.

3. **`should redirect to the correct page when a task is clicked`**  
   - Expands the “Process a Sale” accordion, clicks the “Go to Task” button, and verifies the URL now includes `/sales`.

## Planned Enhancements
- **Task deep links sweep:** Iterate over every task accordion, trigger its CTA, and assert each route matches the task metadata.
- **Search empty state:** Enter a nonsense term and verify the task list collapses to an explicit “No tasks found” message.
- **Content rendering:** Expand several tasks to ensure markdown lists, links, and any media/embedded tips render with expected semantics.


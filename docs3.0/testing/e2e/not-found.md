# Not Found Page E2E

**Spec:** `cypress/e2e/not-found.cy.ts`  
**Primary Role:** `ADMIN` (post-login routing)  
**Routes Exercised:** Arbitrary invalid paths

## Test Cases

1. **`should display 404 page for invalid routes`**  
   - Logs in, visits `/invalid-route-that-does-not-exist`.  
   - Asserts the `<body>` text includes “404”/“Not Found” variants, proving the fallback page rendered.

2. **`should allow navigation back from 404 page`**  
   - Visits `/invalid-route`, confirms the “404 Page Not Found” banner.  
   - Searches for any navigation affordance (links to `/` or `/dashboard`, buttons containing “Home”/“Back”).  
   - If found, clicks the element and asserts the URL no longer includes “invalid-route”.  
   - If absent, simply reasserts the 404 copy, making the test tolerant of different UI implementations.

## Planned Enhancements
- **Role-aware recovery:** Repeat the invalid-route flow as `CASHIER` and `KITCHEN` roles to ensure “back” navigation returns them to `/sessions` or `/kitchen` rather than `/dashboard`.
- **Offline/error fallback:** Simulate missing assets or offline mode while visiting an invalid route to verify the 404 messaging still renders without blocking scripts.


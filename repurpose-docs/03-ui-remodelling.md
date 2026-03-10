# 03 — UI Remodelling for Car Wash

Full remodelling of the UI so every screen and flow is clearly car-wash-oriented. Use this as the spec when building the new repo.

---

## Global / shell

- **App name / branding** — Replace “FROM” / “Pizza” / “Wheely Good” with car wash product name and tagline (e.g. “Car Wash Management” or final name).
- **Nav labels** — Use car wash terms everywhere:
  - Dashboard → **Dashboard** (or “Today” / “Overview”).
  - Products → **Services**.
  - Raw materials / Inventory → **Supplies** (or “Consumables”).
  - Recipes → **Service usage** (if keeping BOM) or remove from nav and hide.
  - Purchases → **Purchases** (or “Receiving” / “Supplies in”).
  - Sales → **Sales** (or “Transactions”).
  - Sessions → **Sessions** (or “Shifts” / “Register sessions”).
  - Expenses → **Expenses**.
  - Kitchen → **Bay view** or **Queue** (optional) or remove.
  - Users → **Team** or **Users**.
  - Reports → **Reports**.
- **Icons** — Swap food/truck icons for car wash–friendly ones (car, water/droplet, soap, receipt, etc.) where it helps.
- **Empty states & help** — All copy rewritten for car wash (e.g. “Add your first service”, “Record supplies”, “Open a session to start selling”).

---

## Page-by-page

### Dashboard

- **Title / subtitle** — e.g. “Today” or “Overview”; no pizza/truck references.
- **Metrics** — Frame as car wash: “Today’s sales”, “Services sold”, “Session status”, “Low supplies”, “Revenue”.
- **Shortcuts** — Open session, New sale, Add expense, View reports — all with car wash wording.

### Services (ex-Products)

- **Page title** — “Services” (e.g. “Wash packages & add-ons”).
- **List/table** — Columns: Name, Code/SKU, Price, Optional: “Uses supplies” (if recipes kept).
- **Actions** — “Add service”, “Edit”, “Deactivate”; no “menu item” or “product” language.
- **Form** — “Service name”, “Service code”, “Price”; optional “Supply usage” (recipe) if applicable.
- **Examples in placeholders** — Basic Wash, Premium Wash, Wax, Interior Detail.

### Supplies (ex-Raw materials / Ingredients)

- **Page title** — “Supplies” or “Consumables”.
- **List/table** — Name, Unit, Low stock level, On hand (from lots), Optional: Unit cost.
- **Actions** — “Add supply”, “Receive stock” (purchase), “Adjust stock”.
- **Form** — “Supply name”, “Unit” (e.g. bottle, gallon, roll), “Low stock alert”.
- **Examples** — Soap, Wax, Microfiber towels, Tire shine.

### Service usage (ex-Recipes) — optional

- **Page title** — “Service usage” or “Supplies per service”.
- **Concept** — “Which supplies (and how much) does each service use?” for COGS.
- If not used: hide from nav and remove or simplify in code later.

### Purchases

- **Page title** — “Purchases” or “Receiving” / “Supplies in”.
- **Copy** — “Record incoming supplies from suppliers”; list by date, supplier, total.
- **Form** — Supplier, line items: supply, quantity, cost; “Receive” / “Save”.

### Sales (POS / transactions)

- **Page title** — “Sales” or “Register” / “Point of sale”.
- **Flow** — Select **services** (not “products”); quantity, price; payment type; complete. Message: “Sell services, not products.”
- **Receipt / confirmation** — “Service” on line items; no “product” or “menu item”.
- **Requirement** — Active session required; message: “Open a session to sell.”

### Sessions

- **Page title** — “Sessions” or “Shifts” / “Register sessions”.
- **Open** — “Opening float”, “Open session” / “Start shift”.
- **Close** — “Closing float”, “Close session” / “End shift”; variance, summary.
- **Copy** — “Start your shift”, “End your shift”, “Session summary”; no “open the truck”.

### Expenses

- **Page title** — “Expenses”.
- **Copy** — “Business expenses” (rent, utilities, repairs, etc.); labels and paid-via; no pizza/truck specifics.

### Bay view / Queue (ex-Kitchen) — optional

- **Page title** — “Bay view” or “Queue” / “Today’s jobs”.
- **Purpose** — Which bay or which jobs are in progress; optional link to sale or service list.
- If single-bay or not needed: remove from nav and UI.

### Team / Users

- **Page title** — “Team” or “Users”.
- **Roles in UI** — Admin, Attendant, Detailer (or Bay) — no Cashier/Kitchen in labels.
- **Copy** — “Who can log in and what they can do.”

### Reports

- **Page title** — “Reports”.
- **Sections** — Sales (by service, by day), Supply usage / inventory, Cash variance, Expenses.
- **Labels** — “Services sold”, “Revenue”, “Supplies consumed”, “Session variance”; no “products” or “ingredients”.

---

## Copy and tone

- **Consistent terms** — Use “service(s)”, “supply/supplies”, “session”, “attendant”, “supplier”, “purchase”, “sale” everywhere.
- **Avoid** — “Product”, “ingredient”, “recipe” (unless “Service usage”), “menu”, “cashier”, “kitchen”, “truck”, “pizza”.
- **Help & onboarding** — Any in-app help or tooltips should describe car wash flows (e.g. “Open a session to start taking payments for washes”).

---

## Theming (optional)

- **Colours / visuals** — Consider a palette that fits “car wash” (e.g. water/blue, clean/white, accent for CTAs) instead of food/truck branding.
- **Favicon / logo** — Replace with car wash or generic business logo in the new repo.

This document is the UI remodelling spec for the dedicated car wash repo.

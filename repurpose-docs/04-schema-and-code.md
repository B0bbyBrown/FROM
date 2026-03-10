# 04 — Schema and Code Strategy

How to treat schema and code in the **new** car wash repo: renames, optional simplifications, and what to leave as-is.

---

## Option A: Minimal schema change (fastest)

- **Keep** existing table and column names (`items`, `type: RAW | PRODUCT`, `recipes`, `recipeItems`, etc.).
- **Restrict** changes to:
  - App name, env (e.g. `car-wash.db`), config.
  - **All user-facing strings** in UI and seed data (Services, Supplies, Attendant, etc.).
  - Seed data: services (PRODUCT), supplies (RAW), optional recipe data.
- **Pros:** Fewer migrations, less risk.  
- **Cons:** Code and DB still say “product”, “ingredient”, “recipe” internally.

---

## Option B: Align names in schema/code (recommended for “full remodelling”)

Rename for clarity and consistency. Do this in the **new repo** so the codebase reads like a car wash app.

### Tables / concepts to consider renaming (logical)

| Current | Car wash–aligned (optional) | Notes |
|---------|-----------------------------|--------|
| `items` (type RAW / PRODUCT) | Keep `items`; consider `itemType: 'CONSUMABLE' \| 'SERVICE'` in code/enums | Or keep RAW/PRODUCT and only rename in UI. |
| `recipes` | `serviceUsage` or keep `recipes` | If you keep “supplies per service”, same table. |
| `recipeItems` | `serviceUsageItems` or keep | Links service (product) to supplies (raw) and quantity. |
| `inventoryLots` | Could stay or `supplyLots` | Clarity. |
| `stockMovements` | Could stay or `supplyMovements` | Clarity. |
| `sessionInventorySnapshots` | Could stay or `sessionSupplySnapshots` | If keeping bay/session stock. |

### Enums / constants

- **Roles:** `CASHIER` → `ATTENDANT`, `KITCHEN` → `DETAILER` (or remove). Update in DB enum and all role checks.
- **Item type:** If renaming: `RAW` → `CONSUMABLE`, `PRODUCT` → `SERVICE` (requires migration and code paths).
- **Sale item status:** Keep or map to car wash (e.g. PENDING → RECEIVED → IN_PROGRESS → DONE for bay workflow).

### What to leave as-is

- `users`, `cashSessions`, `sales`, `saleItems`, `purchases`, `purchaseItems`, `suppliers`, `expenses` — same names are fine; only UI/labels change unless you want “sessions” → “shifts” in DB too (optional).

---

## Optional simplifications

- **Recipes / service usage** — If you don’t need COGS per service, you can:
  - Hide recipe UI and not create recipe data, or
  - Remove recipe tables and all recipe-based inventory deduction from sales (services then don’t consume supplies in code).
- **Session inventory snapshots** — If you don’t track “stock moved to bay per shift”, you can drop or simplify this flow later to reduce complexity.

---

## Code strategy (new repo)

1. **Clone FROM** into new repo; change app name, README, env, db filename.
2. **Global find/replace (with review):**  
   - “Product” → “Service”, “Ingredient” / “Raw material” → “Supply” / “Consumable” in **user-facing** strings (and optionally in variable/type names if you want full alignment).
3. **Role renames:** Replace CASHIER → ATTENDANT, KITCHEN → DETAILER everywhere (DB seed, auth, routes, UI).
4. **Seed script:** Car wash services (e.g. Basic Wash, Premium, Wax), supplies (soap, wax, towels), one supplier; optional service-usage (recipe) data.
5. **Schema migrations (if Option B):** Add migrations for enum/column renames; update Drizzle schema and all references.
6. **Tests and routes:** Update any assertions or API docs that reference “product” or “ingredient” to “service” or “supply”.

---

## File and folder renames (suggested)

- `pizza-truck.db` → `car-wash.db` (or your app name).
- In docs/README: remove “pizza”, “food truck”; use “car wash”.
- Component/page names: e.g. `Products.tsx` → `Services.tsx`, `raw-materials` → `supplies`, `recipes` → `service-usage` (if kept). Route paths: `/products` → `/services`, `/raw-materials` → `/supplies`, etc.

This keeps the new repo consistent and maintainable as a car wash system.

# 02 — Domain Mapping (FROM → Car Wash)

## Core entities

| FROM | Car wash equivalent | Notes |
|------|---------------------|--------|
| **Products** (items type=PRODUCT) | **Services** | Basic Wash, Premium Wash, Wax, Interior Detail, etc. Name, SKU/code, price. |
| **Raw materials / Ingredients** (items type=RAW) | **Supplies / Consumables** | Soap, wax, towels, tire shine, etc. Unit, low-stock level, suppliers. |
| **Recipes (BOM)** | **Service usage** (optional) | Optional: “Premium Wash uses X soap, Y wax” for COGS. Or omit for simple service-only POS. |
| **Suppliers** | **Suppliers** | Same — vendors for supplies (and equipment). |
| **Purchases / Purchase items** | **Purchases / Purchase items** | Same — receiving supplies; creates inventory lots. |
| **Inventory lots** | **Supply lots** | Same concept — FIFO batches of consumables. |
| **Stock movements** | **Supply movements** | Same — PURCHASE, SALE_CONSUME, ADJUSTMENT, WASTAGE, SESSION_OUT, SESSION_IN. |
| **Cash sessions** | **Cash sessions** | Same — open/close register, opening/closing float, link sales to shift. |
| **Sales / Sale items** | **Sales / Sale items** | Same — transaction = one or more services sold; payment type; session. |
| **Expenses** | **Expenses** | Same — rent, utilities, repairs, misc. |
| **Users** | **Users** | Same; roles renamed (see below). |
| **Session inventory snapshots** | **Session supply snapshots** (optional) | Optional if tracking “bay stock” per shift; else can simplify/remove later. |

## Roles

| FROM role | Car wash role | Permissions (conceptual) |
|-----------|----------------|--------------------------|
| **ADMIN** | **ADMIN** | Full access, users, config, reports. |
| **CASHIER** | **ATTENDANT** | POS, open/close session, view supplies, sales. |
| **KITCHEN** | **DETAILER** or **BAY** | Optional: “bay view”, service queue, supply usage. Or drop to Admin + Attendant only. |
| **DEV** | **DEV** | Keep if needed for support. |

## Workflows

| FROM workflow | Car wash workflow |
|---------------|-------------------|
| Open truck → Start session, check inventory | Open location → Start session, check supplies |
| Sell products (menu) → Payment → Inventory deduction (if recipe) | Sell services (wash menu) → Payment → Optional supply deduction (if service usage) |
| Receive delivery → Purchase → Inventory lots | Receive delivery → Purchase → Supply lots |
| Close truck → Close session, reconcile float | Close shift → Close session, reconcile float |
| Kitchen view (orders / prep) | Bay view or job queue (optional): car in bay, services done |

## Optional / future (new repo, later)

- **Memberships** — Unlimited washes per month; recurring.
- **Vehicles** — License plate or vehicle ID for loyalty or reporting.
- **Bays** — Multi-bay: which bay a sale or job is tied to.
- **Loyalty / punch cards** — N washes for fixed price.

These are not required for the initial repurpose; the mapping above is enough to remodel UI and data naming.

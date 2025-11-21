# Database Documentation

## Overview

The Wheely Good Pizza Tracker uses SQLite for data storage. This choice provides:

- Zero-configuration setup
- Single file storage (`pizza-truck.db` in the project root)
- No external dependencies
- Perfect for single-location deployments

## Schema Management

The database schema is managed by Drizzle ORM and is defined in `shared/schema.ts`. This file is the single source of truth for the database structure. The `CREATE TABLE` statements below are for illustrative purposes and are derived from the Drizzle schema.

## Schema

### Core Tables

#### `users`
- Stores user accounts with roles for authorization.
- The database is seeded with `ADMIN`, `CASHIER`, and `KITCHEN` users by default.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('ADMIN', 'CASHIER', 'KITCHEN')) NOT NULL DEFAULT 'CASHIER',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### `items`
- A unified table for all inventory items, including raw ingredients, manufactured sub-assemblies, and sellable products.
- The `type` column distinguishes between them.

```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  type TEXT CHECK(type IN ('RAW', 'MANUFACTURED', 'SELLABLE')) NOT NULL,
  unit TEXT NOT NULL,
  price REAL,
  low_stock_level REAL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Inventory Management

#### `inventory_lots`
- Tracks distinct batches of items for FIFO (First-In, First-Out) costing and consumption.
- New lots are created by purchases.
- Lots are consumed by sales.

```sql
CREATE TABLE inventory_lots (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_cost REAL NOT NULL,
  purchased_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### `stock_movements`
- Provides a full audit trail for every change to inventory.

```sql
CREATE TABLE stock_movements (
  id TEXT PRIMARY KEY,
  kind TEXT CHECK(kind IN ('PURCHASE', 'SALE_CONSUME', 'ADJUSTMENT', 'WASTAGE', 'SESSION_OUT', 'SESSION_IN')) NOT NULL,
  item_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  reference TEXT,
  note TEXT,
  created_at INTEGER NOT NULL
);
```

### Sales & Sessions

#### `cash_sessions`
- Tracks business operating periods (e.g., a day's shift).

```sql
CREATE TABLE cash_sessions (
  id TEXT PRIMARY KEY,
  opened_at INTEGER NOT NULL,
  opened_by TEXT NOT NULL,
  closed_at INTEGER,
  closed_by TEXT,
  opening_float REAL DEFAULT 0 NOT NULL,
  closing_float REAL,
  notes TEXT
);
```

#### `sales` & `sale_items`
- `sales` records the overall transaction details.
- `sale_items` records the individual line items within that sale.

```sql
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT NOT NULL,
  total REAL NOT NULL,
  cogs REAL NOT NULL,
  payment_type TEXT CHECK(payment_type IN ('CASH', 'CARD', 'OTHER')) NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
);
```

### Supporting Tables

#### `suppliers` & `purchases` & `purchase_items`
- These tables track the procurement of new inventory from suppliers.

```sql
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  supplier_id TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE purchase_items (
  id TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  total_cost REAL NOT NULL
);
```

#### `recipe_items`
- Defines the Bill of Materials (BOM) for `MANUFACTURED` or `SELLABLE` items.

```sql
CREATE TABLE recipe_items (
  id TEXT PRIMARY KEY,
  parent_item_id TEXT NOT NULL,
  child_item_id TEXT NOT NULL,
  quantity REAL NOT NULL
);
```

#### `expenses`
- Tracks miscellaneous business expenses.

```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_via TEXT CHECK(paid_via IN ('CASH', 'CARD', 'OTHER')) NOT NULL,
  created_at INTEGER NOT NULL
);
```

## Data Flow

1.  **Inventory Management**:
    -   Purchases of `RAW` items create new `inventory_lots`.
    -   Sales of `SELLABLE` items look up the `recipe_items` to find the required child items, then consume the oldest `inventory_lots` for those items (FIFO).
    -   `stock_movements` track all these changes.

2.  **Session Management**:
    -   Opening a session can trigger `SESSION_OUT` stock movements to track inventory moved to a mobile location.
    -   Closing a session can trigger `SESSION_IN` movements to return unused stock.

## Utilities

### Reset Database
To start fresh with a fully seeded database:
1. Stop the server.
2. Delete `pizza-truck.db` from the project root.
3. Run `npm run dev:reset`.

### Backup Database
Simply make a copy of the `pizza-truck.db` file.

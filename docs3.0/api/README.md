# API Documentation

## Overview

The Wheely Good Pizza Tracker API is a RESTful service built with Express.js. All endpoints are available at `/api`.

## Authentication

The API uses a session-based authentication system. Users must log in via the `/api/auth/login` endpoint to acquire a session cookie. This cookie must be included in all subsequent requests to protected endpoints.

### Roles & Authorization

Most endpoints are protected and require a specific user role. The API will return a `401 Unauthorized` error if no session is active, or a `403 Forbidden` error if the user's role does not have permission to access the endpoint.

The roles are:
- **`ADMIN`**: Full access to all endpoints, including user management and reporting.
- **`CASHIER`**: Access to sales, session management, and some inventory endpoints.
- **`KITCHEN`**: Access to kitchen-specific endpoints (e.g., viewing orders) and some inventory information.

## Common Patterns

### Response Format

Success responses return JSON. Error responses follow this format:
```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

## Endpoints

---

### Authentication

#### `POST /api/auth/login`
Logs a user in and establishes a session.

**Request Body:**
```json
{
  "email": "admin@pizzatruck.com",
  "password": "password"
}
```

#### `POST /api/auth/logout`
Logs the current user out and destroys the session.

#### `GET /api/auth/me`
_Authentication required._
Returns the currently authenticated user's information.

---

### User Management

#### `GET /api/users`
_Requires `ADMIN` role._
Lists all users in the system.

#### `POST /api/users`
_Requires `ADMIN` role._
Creates a new user.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "cashier@pizzatruck.com",
  "password": "password123",
  "role": "CASHIER"
}
```

---

### Items (Ingredients & Products)

The system uses a unified `items` model for all inventoried entities. The `type` field differentiates them: `RAW` (ingredients), `MANUFACTURED` (sub-assemblies), and `SELLABLE` (products).

#### `GET /api/raw-materials`
_Authentication required._
List all items of all types.

#### `POST /api/raw-materials`
_Requires `ADMIN` role._
Create a new item (ingredient, sub-assembly, or sellable product). The `recipe` array is optional and only applies to `MANUFACTURED` or `SELLABLE` items.

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "sku": "PIZ-MAR",
  "type": "SELLABLE",
  "unit": "unit",
  "price": 12.00,
  "lowStockLevel": 10,
  "recipe": [
    {
      "childItemId": "uuid-of-pizza-dough",
      "quantity": 1
    },
    {
      "childItemId": "uuid-of-tomato-sauce",
      "quantity": 0.2
    }
  ]
}
```

#### `GET /api/raw-materials/:id/recipe`
_Authentication required._
Get the recipe for a specific `MANUFACTURED` or `SELLABLE` item.

---

### Cash Sessions

#### `GET /api/sessions`
_Authentication required._
List all cash sessions.

#### `GET /api/sessions/active`
_Authentication required._
Get the currently active session, if any. Returns `null` if no session is active.

#### `POST /api/sessions/open`
_Requires `CASHIER` or `ADMIN` role._
Opens a new cash session. Fails if a session is already active.

**Request Body:**
```json
{
  "openingFloat": 100.00,
  "notes": "Morning shift",
  "inventory": [
    {
      "itemId": "uuid-of-flour",
      "quantity": "10.5"
    }
  ]
}
```

#### `POST /api/sessions/:id/close`
_Requires `CASHIER` or `ADMIN` role._
Closes an active session.

**Request Body:**
```json
{
  "closingFloat": 250.00,
  "notes": "End of day",
  "inventory": [
    {
      "itemId": "uuid-of-flour",
      "quantity": "8.2"
    }
  ]
}
```

---

### Sales

#### `GET /api/sales`
_Authentication required._
List all sales. Supports optional `?from` and `to` date string query parameters to filter by a date range.

#### `POST /api/sales`
_Requires `CASHIER` or `ADMIN` role._
Creates a new sale. An active session is recommended but not strictly required.

**Request Body:**
```json
{
  "sessionId": "uuid-of-active-session",
  "paymentType": "CASH",
  "items": [
    {
      "itemId": "uuid-of-margherita-pizza",
      "qty": 2
    }
  ]
}
```

#### `GET /api/sales/:id/items`
_Authentication required._
Gets the line items for a specific sale.

---

### Kitchen

#### `GET /api/kitchen/orders`
_Requires `KITCHEN` role._
Gets a list of all current sale items that have a `PENDING` or `PREPPING` status.

#### `PATCH /api/sale-items/:id/status`
_Requires `KITCHEN` role._
Updates the status of a specific line item in a sale.

**Request Body:**
```json
{
  "status": "PREPPING"
}
```

---

### Stock Management

#### `GET /api/stock/current`
_Authentication required._
Gets the current aggregated stock level for all items.

#### `GET /api/stock/low`
_Authentication required._
Gets items that are below their configured low stock level.

#### `POST /api/stock/adjust`
_Requires `ADMIN` or `CASHIER` role._
Adjusts stock levels for an item. Creates an `ADJUSTMENT` or `WASTAGE` stock movement record.

**Request Body:**
```json
{
  "itemId": "uuid-of-flour",
  "quantity": "-0.5",
  "note": "Wastage"
}
```

#### `GET /api/stock/movements`
_Authentication required._
Gets stock movements. Can be filtered by item with `?itemId=uuid` query parameter.

---

### Purchases & Suppliers

#### `GET /api/purchases`
_Authentication required._
List all purchases.

#### `POST /api/purchases`
_Requires `ADMIN` or `CASHIER` role._
Creates a new purchase, which creates `inventory_lots` and `PURCHASE` stock movements.

**Request Body:**
```json
{
  "supplierId": "uuid-of-supplier",
  "notes": "Weekly order",
  "items": [
    {
      "itemId": "uuid-of-flour",
      "quantity": "50",
      "totalCost": "100.00"
    }
  ]
}
```

#### `GET /api/suppliers`
_Authentication required._
List all suppliers.

#### `POST /api/suppliers`
_Requires `ADMIN` or `CASHIER` role._
Creates a new supplier.

**Request Body:**
```json
{
  "name": "Restaurant Wholesale",
  "phone": "123-456-7890",
  "email": "orders@rw.com"
}
```

---

### Expenses

#### `GET /api/expenses`
_Requires `ADMIN` role._
List all expenses.

#### `POST /api/expenses`
_Requires `ADMIN` role._
Creates a new expense.

**Request Body:**
```json
{
  "label": "Marketing Flyers",
  "amount": 350.00,
  "paidVia": "CARD"
}
```

---

### Reports

#### `GET /api/reports/overview`
_Requires `ADMIN` role._
Gets today's key performance indicators (KPIs).

#### `GET /api/reports/top-products`
_Requires `ADMIN` role._
Gets top-selling products. Supports optional `from` and `to` date string query parameters.

#### `GET /api/reports/activity`
_Requires `ADMIN` role._
Gets a recent activity feed. Supports an optional `limit=N` query parameter.

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (logged in, but insufficient role)
- `404` - Not Found
- `409` - Conflict (e.g., session already active)
- `500` - Server Error

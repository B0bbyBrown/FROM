# FROM — Financial, Resources & Operations Management

## Overview

- **FROM** = **F**inancial, **R**esources, and **O**perations **M**anagement. This web app covers all three pillars for food truck / single-location businesses (e.g. a food truck).
- **Financial**: Cash sessions, sales, expenses, and reporting.
- **Resources**: Inventory (FIFO), raw materials, purchases, suppliers, recipes (BOM).
- **Operations**: Session open/close, POS, kitchen workflow, users, and role-based access.
- Built with React (frontend), Express (backend), SQLite (database), and Drizzle ORM.
- **Key Workflow**:
  - **Admins** pre-configure the app (users, products/recipes, inventory/suppliers via Purchases).
  - **Cashiers** log in, open a cash session (redirect if none active), then use POS for sales.
  - **Kitchen** staff have limited access (inventory view, order queue).
  - Login redirects by role and session status (e.g. to /sessions if no active session).
- Features include FIFO inventory tracking, real-time stock updates, financial reporting, and role-based access (ADMIN, CASHIER, KITCHEN).

## Technology Stack

This project uses a modern, full-stack TypeScript approach.

- **Frontend**:

  - **Framework**: React with Vite for a fast development experience.
  - **Styling**: Tailwind CSS for utility-first styling, with components from Shadcn UI and Radix UI.
  - **Data Fetching**: TanStack Query for server state management and caching.
  - **Routing**: Wouter for simple and lightweight routing.
  - **Charting**: Recharts for creating beautiful charts.

- **Backend**:

  - **Runtime**: Node.js with Express.js as the web server framework.
  - **Database**: SQLite via `better-sqlite3` for a simple, file-based database.
  - **ORM**: Drizzle ORM for type-safe and powerful database queries.
  - **Authentication**: `express-session` for managing user sessions.
  - **Validation**: Zod for robust schema validation.

- **Shared**:
  - **Language**: TypeScript across the entire stack.
  - **Package Manager**: `npm`

## Table of Contents

- [Getting Started](./getting-started/README.md)
- [Architecture](./architecture/README.md)
- [Frontend](./frontend/README.md)
- [Backend](./backend/README.md)
- [API Reference](./api/README.md)
- [Database](./database/README.md)
- [Deployment](./deployment/README.md)
- [Contributing](./contributing/README.md)

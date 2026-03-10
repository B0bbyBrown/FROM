# Repurpose: FROM → Car Wash Management System

This folder outlines the plan to repurpose the **FROM** (Financial, Resources & Operations Management) platform as a **dedicated car wash management system** in a **new repository**, with **full remodelling of the UI** to best fit the car wash domain.

---

## Purpose

- **Source:** This repo (FROM — pizza/food truck management).
- **Target:** A new, dedicated repo for car wash management.
- **Scope:** Full UI remodelling and domain alignment; schema/code adapted as needed.

---

## Documents in this folder

| Document | Description |
|----------|-------------|
| [01-overview.md](./01-overview.md) | Vision, goals, and high-level approach |
| [02-domain-mapping.md](./02-domain-mapping.md) | FROM concepts → Car wash equivalents (data & features) |
| [03-ui-remodelling.md](./03-ui-remodelling.md) | Page-by-page UI remodelling for car wash |
| [04-schema-and-code.md](./04-schema-and-code.md) | Schema renames, optional simplifications, code strategy |
| [05-implementation-checklist.md](./05-implementation-checklist.md) | Phased checklist for the new repo |

---

## Quick reference

- **Products** → **Services** (e.g. Basic Wash, Premium Wash, Wax, Detail).
- **Raw materials / Ingredients** → **Supplies / Consumables** (soap, wax, towels, etc.).
- **Recipes (BOM)** → Optional **Service usage** (consumables per service for COGS).
- **Cashier** → **Attendant**; **Kitchen** → **Bay / Detailer** (or simplify to Admin + Attendant).
- **Cash sessions, Sales, Purchases, Expenses, Suppliers** → Same concepts; UI and copy tailored to car wash.

Use this folder as the single source of truth when creating the new repo and applying the remodelling.

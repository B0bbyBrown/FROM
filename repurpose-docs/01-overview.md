# 01 — Overview

## Vision

Repurpose FROM as a **car wash management system** in a **dedicated new repository**, with **full remodelling of the UI** so that terminology, workflows, and layout align with how a car wash operates (services, supplies, bays, attendants, sessions).

## Goals

1. **Dedicated repo** — New codebase for car wash only; no mixing with pizza/food-truck.
2. **Full UI remodelling** — Every screen and term reframed for car wash (Services, Supplies, Attendant, Sessions, etc.).
3. **Domain alignment** — Data model and copy reflect car wash reality (wash packages, consumables, optional bays/memberships later).
4. **Preserve strengths** — Keep session-based POS, inventory (supplies), purchases, expenses, and reporting; adapt, don’t strip.

## Approach

- **Copy FROM** into the new repo as the starting point.
- **Rename and restyle** all user-facing surfaces (nav, pages, labels, empty states, help text).
- **Remodel UI** (layout, wording, icons, flows) so it feels native to a car wash.
- **Adjust schema/code** where it clarifies meaning (e.g. `SERVICE` / `CONSUMABLE` or consistent renames); optionally simplify recipes/session-inventory if not needed.
- **Seed data** — Car wash services and supplies from day one.

## Out of scope (for this doc set)

- Implementation inside this (FROM) repo — the work happens in the **new** repo.
- Final naming of the new product (e.g. “ShineHub”, “WashOps”) — placeholder “Car Wash Management” is used in these docs.

## Success criteria

- A car wash operator can use the new app without seeing any pizza/food-truck language.
- All core flows (open/close session, sell services, record supplies/purchases/expenses, view reports) work and are clearly labelled for car wash use.

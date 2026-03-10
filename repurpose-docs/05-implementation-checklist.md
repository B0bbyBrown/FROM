# 05 — Implementation Checklist

Use this in the **new** car wash repo. Order is approximate; adjust to your workflow.

---

## Phase 1: Repo and baseline

- [ ] Create new repo (e.g. `car-wash-mgmt`); do not develop in FROM repo.
- [ ] Copy FROM codebase into new repo (or clone and replace remote).
- [ ] Update `package.json` name and any app title.
- [ ] Set env: `DATABASE_URL` or default to `car-wash.db` (or chosen name).
- [ ] Run `npm install`, `npm run dev`; confirm app runs and DB is created.
- [ ] Update root `README.md`: describe car wash app, not pizza/truck; link to this repurpose-docs set if you copy it over.

---

## Phase 2: Global renames and copy

- [ ] Replace app branding: “FROM” / “Pizza” / “Wheely Good” → car wash name (or “Car Wash Management”).
- [ ] Nav: Products → Services, Raw materials → Supplies, Recipes → Service usage (or remove), Kitchen → Bay view (or remove), Cashier → Attendant, Kitchen → Detailer.
- [ ] All user-facing strings: “product” → “service”, “ingredient” / “raw material” → “supply” / “consumable” in UI (titles, buttons, placeholders, errors, empty states).
- [ ] Roles: CASHIER → ATTENDANT, KITCHEN → DETAILER in seed, auth, and UI (and in DB if doing schema renames).
- [ ] Help and onboarding text: rewrite for car wash (sessions, selling services, supplies, etc.).

---

## Phase 3: Page-by-page UI remodelling

- [ ] **Dashboard** — Car wash metrics and copy; no truck/pizza references.
- [ ] **Services** (ex-Products) — Labels, placeholders, examples (Basic Wash, Premium, Wax).
- [ ] **Supplies** (ex-Raw materials) — Labels, placeholders, examples (soap, wax, towels).
- [ ] **Service usage** (ex-Recipes) — If kept: relabel and examples; if not: hide/remove from nav.
- [ ] **Purchases** — “Supplies in” / “Receiving” copy; supplier and line items as supplies.
- [ ] **Sales / POS** — “Services” in selector and receipt; session required message.
- [ ] **Sessions** — “Shift” / “Session” copy; open/close float and summary.
- [ ] **Expenses** — Car wash–neutral copy.
- [ ] **Bay view** (ex-Kitchen) — Relabel or remove.
- [ ] **Team / Users** — Role names Attendant, Detailer, Admin.
- [ ] **Reports** — “Services sold”, “Supplies”, “Revenue”, “Variance”; no product/ingredient wording.

---

## Phase 4: Schema and code (optional but recommended)

- [ ] Decide: Option A (minimal schema) vs Option B (rename enums/tables for car wash).
- [ ] If Option B: add migrations for role enums (ATTENDANT, DETAILER), item types (SERVICE, CONSUMABLE) if desired, and any table renames; update Drizzle schema and all references.
- [ ] Route paths: `/products` → `/services`, `/raw-materials` → `/supplies`, etc.
- [ ] Component/file renames: e.g. `Products.tsx` → `Services.tsx`, `raw-materials.tsx` → `supplies.tsx`.
- [ ] API and shared types: rename request/response and types to “service”/“supply” where it improves clarity.

---

## Phase 5: Seed data and config

- [ ] Seed: default admin user (e.g. admin@carwash.com); roles ATTENDANT, DETAILER if used.
- [ ] Seed: 3–5 **services** (e.g. Basic Wash, Premium Wash, Wax, Interior Detail) with prices.
- [ ] Seed: 4–6 **supplies** (e.g. Soap, Wax, Microfiber towels, Tire shine) with units and low-stock.
- [ ] Seed: 1–2 **suppliers**; 1–2 sample **purchases** and **inventory lots** if you want demo data.
- [ ] Optional: **Service usage** (recipe) for 1–2 services so COGS and supply deduction work in demo.
- [ ] Remove or replace any pizza/truck seed data and references.

---

## Phase 6: Polish and docs

- [ ] Favicon / logo: car wash or generic.
- [ ] Theming: adjust colours if desired (e.g. blue/water, clean look).
- [ ] Copy this `repurpose-docs` folder into the new repo (or link from README) for future reference.
- [ ] Update in-repo docs (e.g. `docs/`) to describe car wash flows, not pizza/truck.
- [ ] Smoke-test: open session → sell 1–2 services → close session → check reports and supply levels (if using service usage).

---

## Later (backlog)

- [ ] Memberships / unlimited plans.
- [ ] Vehicle or license plate (for loyalty/reporting).
- [ ] Bays (multi-bay assignment).
- [ ] Loyalty or punch cards.

---

When you close and move forward, start with Phase 1 in the new repo, then Phase 2 and 3 for a fully remodelled car wash UI; Phase 4 and 5 can follow in the same or next sprint.

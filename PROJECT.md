# Raunaq POS — Project spec

Sibling of `D:\Projects\Raunaq-POS-System`. Same product, cleaner layout.

## Layout

```text
Raunaq-POS/
  frontend/     Next.js 15 — website + POS + admin (one app)
  backend/      Express + Prisma + PostgreSQL
```

Not an npm workspace. No `@pos/shared` package. No Electron, mobile, Docker, or git init (you init when ready).

## URLs

- Public: `/`, `/features`, `/pricing`, `/about`, `/contact`
- Shop: `/pos/login`, `/pos`, `/pos/sale`, …
- Platform: `/admin`, `/admin/clients`, `/admin/sales-reps`

## Backend

- Express 4, helmet, cors, cookie-parser, express-rate-limit, pino
- Prisma 6 + PostgreSQL (schema copied from the original app)
- JWT httpOnly cookies (`pos_access` / `pos_refresh`)
- Tenant id for shop users comes from JWT only
- Feature keys live in `backend/src/constants/` (copied into `frontend/src/lib` when POS is ported)
- API paths stay root-level: `POST /auth/login`, `GET /health`
- Next.js rewrites `/api/:path*` → `http://localhost:3001/:path*`

## Port rule

Copy domain services and Prisma as-is. Rewrite only HTTP adapters (Fastify → Express) and UI routing (Vite/React Router → Next.js). Do not rewrite sale totals, ledger FIFO, or sync apply logic.

## Stages

0. Scaffold (this folder)
1. Express platform + health
2. Auth, permissions, users, tenants
3. Inventory, catalog, customers, billing APIs
4. Reports, settings, branches, admin, support, sync
5. Marketing pages (SaleChat site at `/`, `/features`, `/pricing`, `/about`, `/contact`; Login → `/pos/login`)
6. POS shell (login at `/pos/login`, dashboard at `/pos`)
7. POS feature screens
8. Platform admin
9. CI + README polish + parity checklist

## Seed logins (after seed runs)

- Super Admin: `superadmin@nexmind.com` / `SuperAdmin123!`
- Sales rep: `sales@nexmind.com` / `SalesRep123!`
- Demo shop: `owner@demo.shop` / `DemoShop123!`

## Branding

Marketing site and POS UI are SaleChat (ported from the latest branding pull). Receipts still use `BRAND` from `frontend/src/lib/brand.ts` / `backend/src/constants/brand.ts`.

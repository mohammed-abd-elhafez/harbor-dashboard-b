# Harbor Goods Dashboard: Backend Specification

**Status:** v1.0, implemented as `harbor-api` v0.1 (see section 14 for deviations)
**Consumer:** `harbor-dashboard-b` (React SPA, variant "Dark Ops")
**Scope:** the HTTP API, data model, and operations needed to replace the MSW mocks in the frontend.

---

## 1. Goals and non-goals

### 1.1 Goals

1. Serve the exact `OverviewDto` the frontend already consumes (`src/domain/types.ts`), so the swap is a one-line change in `createRepository()`.
2. Provide real pagination for the Order log and a live feed for Live orders.
3. Authenticate a small set of admin users.
4. Be simple to run: one service and one database, with a seeded local setup in under five minutes.

### 1.2 Non-goals (v1)

- Checkout, payments, or any customer-facing store function.
- Multi-tenant (multiple stores). One store, `Harbor Goods`.
- Role-based permissions beyond `admin`.
- Writing or editing orders from the dashboard (read-only analytics).

---

## 2. Architecture

```
Browser (SPA) --HTTPS--> API (Hono, Node 22) --SQL--> PostgreSQL 16
                              |
                              +-- SSE stream (/api/orders/stream)
                              +-- Nightly job: daily_stats rollup
```

- **Stateless API.** Sessions live in the database, so the API can be scaled horizontally.
- **Layering:** `routes -> services -> repositories -> db`. Routes validate and serialize, services hold business rules (period math, comparisons), repositories own SQL.
- **Single source of types:** response schemas are Zod schemas in `packages/contracts`, shared by the API and (optionally) the SPA.

### 2.1 Recommended stack

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node 22 LTS, TypeScript 5.6 (`strict`) | Same language as the SPA |
| HTTP | Hono | Small, fast, typed routes, built-in SSE helper |
| Validation | Zod | Runtime validation and shared types |
| Database | PostgreSQL 16 | Window functions and `date_trunc` for aggregation |
| Data access | Drizzle ORM + SQL migrations | Typed queries without hiding SQL |
| Auth | Server sessions, `HttpOnly` cookie, Argon2id hashes | No tokens in JS-readable storage |
| Tests | Vitest, Testcontainers (real Postgres) | Aggregations must be tested against real SQL |
| Logging | Pino, JSON to stdout | Structured logs |
| Container | Docker, one image | Portable deploy |

Local-only alternative: SQLite via `better-sqlite3` behind the same repository interfaces. Acceptable for a demo, not for production.

### 2.2 Repository layout

```
harbor-api/
  package.json
  drizzle.config.ts
  Dockerfile
  .env.example
  src/
    server.ts                 App bootstrap, middleware, graceful shutdown
    config.ts                 Env parsing (Zod), fails fast on bad config
    routes/
      overview.ts
      orders.ts
      stream.ts
      auth.ts
      health.ts
    services/
      overview.service.ts     Period math, comparisons, chart sampling
      orders.service.ts
      auth.service.ts
    repositories/
      orders.repo.ts
      products.repo.ts
      stats.repo.ts
      sessions.repo.ts
    db/
      schema.ts               Drizzle tables
      migrations/
      seed.ts                 Reproduces the frontend fixtures
    middleware/
      auth.ts  rate-limit.ts  error-handler.ts  request-id.ts
    lib/
      time.ts                 UTC window helpers
      errors.ts               AppError, error codes
  tests/
    unit/  integration/
```

---

## 3. Data model

All timestamps are `timestamptz` stored in UTC. Money is stored as integer cents.

```
customers(id uuid pk, name text, email text unique, created_at)
products (id uuid pk, name text unique, stock int >= 0, low_stock_threshold int default 15,
          critical_stock_threshold int default 8, created_at)
orders   (id bigint pk, public_id text unique,        -- '#10482'
          customer_id fk, product_id fk,
          total_cents int > 0,
          status text check in ('paid','pending','shipped','refunded'),
          created_at, updated_at)
visits   (id bigint pk, source text check in ('search','direct','social','email'),
          occurred_at, converted bool)
daily_stats(day date pk, revenue_cents bigint, orders int, visits int, conversions int)
users    (id uuid pk, email text unique, password_hash text, created_at)
sessions (id text pk, user_id fk, expires_at, created_at)
```

Indexes: `orders(created_at desc)`, `orders(status, created_at)`, `visits(occurred_at, source)`, `sessions(expires_at)`.

**Stock level** is derived, never stored: `critical` if `stock <= critical_stock_threshold`, `low` if `<= low_stock_threshold`, else `ok`.

---

## 4. API contract

Base path `/api`. JSON only. All routes except `/api/health` and `/api/auth/login` require a valid session.

### 4.1 `GET /api/overview`

| Query | Type | Default |
|---|---|---|
| `range` | `24h` \| `7d` \| `30d` \| `90d` | `30d` |

An invalid `range` falls back to the default, matching the frontend's `parseRange` (it does not return 400).

**Response 200:** `OverviewDto`

```ts
interface OverviewDto {
  range: RangeKey;
  periodLabel: string;        // 'Oct 1 – Oct 31, 2026' (en dash U+2013)
  comparedShort: string;      // 'Sep'
  updatedAt: string;          // 'HH:mm' in the store timezone
  kpis: Kpi[];                // revenue, orders, conversion, avgOrder (fixed order)
  revenueSeries: { points: { label: string; value: number }[] };
  traffic: { id: 'search'|'direct'|'social'|'email'; label: string; percent: number }[];
  recentOrders: OrderRow[];   // latest 5
  pagination: { shown: number; total: number; page: number; pages: number };
  inventory: InventoryItem[]; // 4 lowest-coverage products
  store: { name: string; initial: string };
}
```

The server must output the numeric values the UI formats (`48920`, `3.42`); it must not pre-format currency. Text labels (`periodLabel`, `comparedShort`) are the only formatted strings.

### 4.2 `GET /api/orders`

| Query | Type | Default |
|---|---|---|
| `page` | int >= 1 | 1 |
| `limit` | int 1..100 | 5 |
| `status` | optional status filter | none |
| `range` | same values as `/api/overview` | `30d` (so totals match the overview footer) |

**Response 200:** `{ items: OrderRow[]; pagination: Pagination }`

### 4.3 `GET /api/orders/stream` (Server-Sent Events)

Emits `event: order` with an `OrderRow` payload when an order is created or its status changes, and `event: ping` every 25 s to keep proxies open. The client reconnects with `Last-Event-ID`; the server replays missed events from the last 100.

### 4.4 Auth

| Route | Behavior |
|---|---|
| `POST /api/auth/login` `{ email, password }` | 204 and `Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax; Path=/` |
| `POST /api/auth/logout` | 204, session deleted, cookie cleared |
| `GET /api/auth/me` | `{ id, email }` or 401 |

### 4.5 `GET /api/health`

`200 { status: 'ok', db: 'up' }`. Used by the platform health check; no auth.

### 4.6 Error format

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "limit must be <= 100", "requestId": "..." } }
```

| HTTP | `code` |
|---|---|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHENTICATED` |
| 404 | `NOT_FOUND` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL` (no stack traces or SQL in the message) |

---

## 5. Business rules for `/api/overview`

Let `end` be the start of the current store-local day plus one day (exclusive), and `N` the range length: 1, 7, 30, 90 days.

1. **Window:** `[end - N days, end)`. **Previous window:** `[end - 2N days, end - N days)`.
2. **Revenue:** sum of `total_cents` for orders with status `paid` or `shipped`; `pending` and `refunded` are excluded. Returned in dollars.
3. **Orders:** count of all orders in the window, whatever their status. It equals the Order log total.
4. **Avg. order:** `revenue / orders` (all orders in the window), rounded to cents, so it stays consistent with the Orders KPI. (The fixture satisfies `48920 / 1284 = 38.10`.)
5. **Conversion:** `converted visits / visits * 100`, two decimals.
6. **Delta:** `percent` units for revenue, orders, avg order: `(current - previous) / previous * 100`, one decimal. `pt` units for conversion: `current - previous`, one decimal. `direction` is `up` if the difference is `>= 0`. If `previous = 0`, report `0.0` and `up`.
7. **`comparedShort`:** the month name when `N = 30` and the previous window is a calendar month; otherwise `prev 7d`, `prev 90d`, or the day name for `24h`.
8. **Series:** daily revenue (hourly for `24h`), then evenly sampled down to 16 points; never more, so the SPA chart contract holds. Labels: `Oct 1` for daily, `14:00` for hourly.
9. **Traffic:** share of visits per source in the window, integers that sum to 100 (largest-remainder rounding).
10. **Inventory:** the four products with the lowest `stock / low_stock_threshold` ratio, listed best-stocked first. `fillPercent = min(100, round(stock / 130 * 100))`, the same formula the SPA mock uses for non-30d ranges.
11. **Pagination:** `shown = recentOrders.length`, `total` = orders in the window, `pages = ceil(total / 5)`.

Ranges longer than 7 days read from `daily_stats`; shorter ranges read from `orders` directly.

---

## 6. Security

- Passwords: Argon2id. Login rate limit 5 attempts per 15 minutes per IP + email.
- Sessions: random 256-bit ID, 12-hour sliding expiry, stored hashed.
- CORS: only the dashboard origin(s) from `ALLOWED_ORIGINS`, `credentials: true`. If the SPA and API share a site, prefer same-site hosting behind one domain.
- CSRF: `SameSite=Lax` plus a required `Origin` header check on non-GET requests.
- Headers: HSTS, `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'` on API responses.
- Input: every query and body parsed with Zod; unknown fields rejected.
- Secrets only from environment variables, never committed. `.env.example` lists names with dummy values.
- Dependency audit in CI; fail on high severity.

---

## 7. Performance targets

| Metric | Target |
|---|---|
| `/api/overview` p95 | < 250 ms at 1M orders |
| `/api/orders` p95 | < 100 ms |
| SSE connections | 500 concurrent per instance |

The rollup job refreshes `daily_stats` nightly and recomputes the current day every 5 minutes. Add a 15-second in-memory cache keyed by `range` for `/api/overview`.

---

## 8. Observability

- One structured log line per request: method, path, status, duration, `requestId`, user id.
- `X-Request-Id` accepted or generated, returned in every response and error body.
- Metrics (Prometheus format, `/internal/metrics`, not public): request histogram, DB pool usage, SSE client count, rollup job duration.
- Alerts: 5xx rate above 2% for 5 minutes, rollup job failed, DB unavailable.

---

## 9. Testing

| Level | What |
|---|---|
| Unit | Period math, delta rules, largest-remainder rounding, stock level |
| Integration | Each route against a real Postgres (Testcontainers) with seeded data |
| Contract | Response parsed by the shared Zod schema; snapshot of the 30d seed equals the frontend `overview30d` fixture |
| Load | `k6` script for `/api/overview` and the SSE endpoint |

Coverage target: 80% lines, with the aggregation service at 95%.

---

## 10. Deployment

- One Docker image, config entirely through environment variables:

| Variable | Example |
|---|---|
| `DATABASE_URL` | `postgres://user:pass@host:5432/harbor` |
| `SESSION_SECRET` | 32+ random bytes |
| `ALLOWED_ORIGINS` | `https://dashboard.example.com` |
| `STORE_TIMEZONE` | `UTC` |
| `PORT` | `8080` |

- Migrations run as a separate release step (`drizzle-kit migrate`), never on app boot.
- CI: lint, typecheck, unit and integration tests, build image, scan image, deploy on `main`.
- Zero-downtime: backward-compatible migrations only (expand, then contract).

---

## 11. Frontend integration

1. Implement `HttpRepository.getOverview(range)` as `fetch('/api/overview?range=...', { credentials: 'include' })` and set `VITE_USE_MOCKS=false`.
2. Add a login screen and a 401 handler that redirects to it (not designed yet; needs a design decision).
3. Wire Prev/Next to `/api/orders` and replace the static Live orders list with the SSE stream.
4. Keep the MSW handlers for tests; point them at the shared Zod schemas so mocks cannot drift from the API.

---

## 12. Milestones

| # | Milestone | Exit criteria |
|---|---|---|
| B0 | Scaffold | Server boots, `/api/health` green, Docker image builds, CI passing |
| B1 | Data | Migrations, seed reproduces the frontend fixtures exactly |
| B2 | Overview | `/api/overview` for all four ranges, contract tests green |
| B3 | Orders | Pagination and status filter, integration tests green |
| B4 | Auth | Login, logout, session middleware, rate limiting |
| B5 | Live | SSE stream with replay, reconnect test |
| B6 | Hardening | Load test results, metrics, security checklist, runbook |

---

## 13. Open questions

| # | Question | Default |
|---|---|---|
| Q1 | Where do real orders come from: an existing store (Shopify, WooCommerce) or this database? | This database, with an import adapter later |
| Q2 | Where do visit and conversion data come from? | Our own `visits` table; GA4 import is a follow-up |
| Q3 | Single admin or multiple users? | Multiple users, same `admin` role |
| Q4 | Store timezone? | UTC |
| Q5 | Should `refunded` orders reduce revenue (net) instead of being excluded? | Excluded, as in rule 5.2 |
| Q6 | Hosting target and region? | Undecided |
| Q7 | Data retention for `visits`? | 13 months, then roll up |

---

## 14. Implementation notes (harbor-api v0.1)

Built and tested (36 tests). Differences from this document:

| Area | Spec | Implemented | Why |
|---|---|---|---|
| Database | PostgreSQL 16 + Drizzle | SQLite (`better-sqlite3`), plain SQL behind repository interfaces | No Docker on the dev machine; the spec allows SQLite for local use. A Postgres adapter is a contained change. |
| Passwords | Argon2id | scrypt (Node built-in) behind `hashPassword` / `verifyPassword` | Avoids a second native dependency. |
| Rollup | `daily_stats` nightly job | Not built; aggregates are computed from `orders` and `visits` | Fast enough at the seeded size; add the table when volumes require it. |
| Metrics | `/internal/metrics` | Not built | Deferred to B6. |
| Contracts package | Shared Zod schemas | `src/contracts.ts` mirrors the SPA types by hand | No monorepo yet. |
| Sessions | Hashed session id, 12 h sliding | As specified (SHA-256, sliding) | |

Seed data note: the frontend fixture shows Avg. order as -2.3%, which cannot follow from its own +12.4% revenue and +8.1% orders. The seed produces the consistent value (+4.0%) instead; every other fixture number is reproduced exactly.

Simulated orders (`SIMULATE_ORDERS=true`) are stamped from the app clock, so with a frozen `CLOCK_NOW` they land inside the seeded window and raise the order count.

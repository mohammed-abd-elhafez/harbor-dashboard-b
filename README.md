# Harbor Goods Admin, Dark Ops

Single-screen dashboard (variant B "Dark Ops"), built from `DASHBOARD_SPEC_B_DARK_OPS.md`.

## Setup

```bash
npm install
npx playwright install chromium
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with MSW mocks |
| `npm run build` | Typecheck, then production build |
| `npm run preview` | Serve the build on port 4173 |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright layout (and, on Linux, pixel) tests |
| `npm run diff:report` | Diff the running preview against the reference PNG (needs `npm run preview`) |
| `npm run test:pixel:linux` | Pixel test in the pinned Linux Playwright image (needs Docker); CI runs the same image |

## Architecture

`UI -> useOverview(range) -> DashboardRepository -> MSW /api/overview`. Pure logic lives in `src/domain` (formatters, chart math, range parsing). Charts are hand-written SVG. There is no global `box-sizing` reset and Tailwind preflight is off, because the reference layout depends on content-box.



## Running against the real API

The default build uses MSW mocks and needs no sign-in. To use `harbor-api` instead:

```bash
# terminal 1: in harbor-api (see its README to seed and set ALLOWED_ORIGINS to the dev origin)
npm run dev
# terminal 2: here
VITE_USE_MOCKS=false npx vite --port 5174
```

The dev server proxies `/api` to `http://localhost:8080` (override with `API_URL`), so the session cookie stays same-origin. With the real API you get a sign-in screen, Sign out, working Prev/Next, and a live order feed over SSE. `tests/e2e/real-api.spec.ts` covers this flow (`RUN_REAL_API=1 E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e -- real-api`).

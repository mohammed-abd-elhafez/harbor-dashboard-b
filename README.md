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



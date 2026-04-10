---
title: Professor Pixel's Programming Palace
updated: 2026-04-09
status: current
domain: product
---

# Professor Pixel's Programming Palace

A dual-language programming education platform for kids. Pixel — a cyberpunk mascot — guides learners
through building real games using Python and JavaScript, with 3D visualization powered by Babylon.js.

## What It Is

- **Conversational game builder**: Pixel leads students through A/B choices to construct a game scene
  by scene, generating Python code as they go.
- **Dual-language lessons**: Structured lessons that teach the same concept in Python and JavaScript
  side-by-side.
- **In-browser execution**: Python runs via Pyodide (WebAssembly) — no server, no install required.
- **3D visualization**: Babylon.js renders programming concepts spatially for visual learners.

## What It Is Not

- Not a multiplayer platform. Progress is stored locally.
- Not a full Python IDE. The code editor is intentionally simplified for beginners.
- Not a backend service. All execution is client-side.

## Quick Start

**Requirements:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/jbogaty/pixels-pygame-palace.git
cd pixels-pygame-palace
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Application Routes

| URL | What you see |
|-----|-------------|
| `/` | Home page — links to all features |
| `/wizard` | Pixel's interactive game-building wizard |
| `/game-wizard` | Wizard in game-dev flow mode |
| `/lesson/:id` | Structured dual-language lesson |
| `/lesson-demo` | Interactive lesson demonstration |
| `/babylon-demo` | Babylon.js 3D scene with camera controls |

## Project Structure

```
apps/web/         — Main React application
apps/mobile/      — React Native app (stub, not yet functional)
packages/types/   — Shared Zod schemas and TypeScript types
packages/config/  — Shared constants
packages/core/    — Zustand stores
packages/python-sandbox/  — Pyodide wrapper
packages/lesson-engine/   — Lesson execution and conversion
assets/           — Game assets (Git LFS)
tests/            — E2E (Playwright) and unit (Vitest) tests
```

## Running Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires dev server on port 5173)
npx playwright test

# E2E — critical suite only, fastest
npx tsx tests/e2e/run-comprehensive-tests.ts --critical

# E2E — with visible browser
npx tsx tests/e2e/run-comprehensive-tests.ts --headed
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| 3D Graphics | Babylon.js 8 + Reactylon |
| Routing | wouter |
| State | Zustand + TanStack Query |
| Python runtime | Pyodide 0.26.4 (WebAssembly) |
| Code editor | Monaco Editor |
| Linting | Biome |
| Package manager | pnpm 10 (monorepo) |
| E2E testing | Playwright |
| Unit testing | Vitest + Testing Library |

## Contributing

1. Fork the repo and create a branch from `main`.
2. Follow the monorepo structure — add logic to the appropriate `packages/` package.
3. Run `pnpm lint` and `pnpm check` before committing.
4. Write or update tests for any changed behaviour.
5. Open a pull request with a descriptive summary.

See `docs/ARCHITECTURE.md` for system design details and `CLAUDE.md` for agent instructions.

## Assets

All game assets in `assets/` are CC0 or permissively licensed. Sources include Kenney.nl,
OpenGameArt.org, and Freesound.org. Git LFS tracks all binary media files.

---
title: AGENTS.md
updated: 2026-04-09
status: current
domain: technical
---

# Professor Pixel's Programming Palace — Agent Protocols

## Architecture Overview

This is a pnpm monorepo. The primary deliverable is the `apps/web` React SPA. All shared logic
lives in `packages/`. There is no backend server in production — everything runs in the browser.

## Package Responsibilities

### `packages/types`
Zod schemas and TypeScript types shared across all packages. This is the foundation — never import
from higher packages here.

Key exports:
- `LessonSchema`, `LessonStepSchema` — dual-language lesson structure
- `ClientStorage` — localStorage-backed persistence
- `Language` — `'python' | 'javascript' | 'typescript'`

### `packages/config`
Shared constants (scene config, camera defaults, physics settings). No logic.

### `packages/core`
Zustand stores. App-wide state that spans components. Currently contains lesson progress store.

### `packages/python-sandbox`
Wraps Pyodide 0.26.4. Handles:
- Lazy loading (first execution only)
- `print()` stdout capture
- `input()` mock
- Timeout protection (default 5s)
- Variable introspection

API: `PythonSandbox.execute(code, inputs?, timeout?)`

### `packages/lesson-engine`
Contains:
- `LessonEngine` — dispatches execution to Python or JS sandbox
- `JavaScriptSandbox` — isolated `Function()` context, captures `console.*` and `prompt()`
- `LessonConverter` — automated Python-to-JavaScript conversion utilities
- `convertLessonToDualLanguage()` — migrates single-language lessons

### `apps/web`
React 19 SPA. Entry point: `src/main.tsx`. Router: wouter.

Component families:
- `components/babylon/` — Babylon.js scene components (BabylonCanvas, DemoScene, hooks)
- `components/lesson/` — Dual-language lesson UI (LanguageSelector, DualLanguageCodeEditor)
- `components/wizard-*` — Pixel wizard subsystem (dialogue engine, layout, options)
- `components/pygame-*` — Legacy Pygame simulation layer (kept for wizard)
- `lib/` — Utilities: asset library, grading, game templates, persistence, error tracking

## Wizard System

The wizard (`UniversalWizard`) uses a Yarn-style dialogue engine:
- Flow files live in `apps/web/src/lib/` (JSON-driven scenes)
- `wizard-dialogue-engine.tsx` parses dialogue trees
- `wizard-option-handler.tsx` handles A/B choice rendering
- `wizard-layout-manager.tsx` adapts layout to device (phone portrait/landscape/desktop)
- `pixel-presence.tsx` renders the Pixel mascot persistently across all routes

Known bug: `transitionToSpecializedFlow` action is not wired to load external flow JSON.
Fix requires: dialogue engine detecting the action and dynamically importing the target flow.

## Python Execution in Browser

```
User submits code
  → LessonEngine.executeCode({ code, language: 'python' })
  → PythonSandbox.execute()
  → Pyodide.runPythonAsync()  (WebAssembly)
  → captured stdout returned as ExecutionResult
```

No server round-trip. All execution is sandboxed in the browser tab.

## Asset System

Assets in `assets/` are tracked with Git LFS. Categories: sprites, audio, fonts, tilesets, 3D models.
The `AssetLibrary` in `apps/web/src/lib/asset-library/` manages loading and caching at runtime.
All assets must be CC0 or appropriately licensed.

## Storage Modes

The app supports two storage modes, auto-detected at runtime:

| Mode | Trigger | Storage Backend |
|------|---------|-----------------|
| API mode | Default (dev/server) | Express REST API endpoints |
| Static mode | `VITE_STATIC_MODE=true` or `*.github.io` host | `localStorage` via `ClientStorage` |

## Adding a New Lesson

1. Define the lesson in `packages/types` using `LessonSchema`.
2. Add Python implementation to `previewCode.python` and steps.
3. Run `convertLessonToDualLanguage()` to generate JS version, then review.
4. Register in `apps/web/src/lib/data.ts`.

## Adding a New Wizard Flow

1. Create a JSON flow file in `apps/web/src/lib/` following existing flow structure.
2. After fixing `transitionToSpecializedFlow`, register the flow name mapping in the dialogue engine.
3. Test with `npx playwright test wizard-flow-tests.spec.ts`.

## CI Notes

CI uses `npm ci` (not pnpm). This is a mismatch — the repo uses pnpm lockfile.
Before fixing CI, verify `pnpm-lock.yaml` is committed and update the workflow to use pnpm.

## Patterns to Follow

- Error boundaries wrap every route (`AppErrorBoundary`, `PageErrorBoundary`).
- Global error handler initializes on app mount (`globalErrorHandler.initialize()`).
- Performance monitor (`health-monitor.ts`) tracks animation frame budget.
- Session state persists to `localStorage` via `saveSessionState()` / `loadSessionState()`.

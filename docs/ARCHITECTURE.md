---
title: Architecture
updated: 2026-04-09
status: current
domain: technical
---

# System Architecture

## High-Level Overview

Professor Pixel's Programming Palace is a fully client-side React SPA organized as a pnpm monorepo.
There is no required backend in production — data persistence and code execution both run in the
browser.

## Package Dependency Graph

```
packages/types        (Zod schemas, shared TypeScript types)
    |
packages/config       (shared constants, no logic)
    |
packages/core         (Zustand stores)
    |
packages/python-sandbox   packages/lesson-engine
    |                         |
              apps/web   apps/mobile
```

Lower packages must never import from higher ones.

## Execution Boundaries

### Python Execution

```
User code string
  -> packages/lesson-engine: LessonEngine.executeCode({ language: 'python' })
  -> packages/python-sandbox: PythonSandbox.execute()
  -> Pyodide (WebAssembly, runs in browser tab)
  -> ExecutionResult { output, error, variables }
```

Pyodide is lazy-loaded on first Python execution. Subsequent executions reuse the runtime.
Stdout is redirected via Python's `sys.stdout`. `input()` is mocked to prevent blocking.

### JavaScript Execution

```
User code string
  -> packages/lesson-engine: LessonEngine.executeCode({ language: 'javascript' })
  -> JavaScriptSandbox.execute()
  -> isolated function scope
  -> ExecutionResult { output, error }
```

`console.log/warn/error/info` are captured. `prompt()` is mocked.

## Storage Architecture

Two modes, auto-detected at runtime:

```
isStaticMode() === true       ->  ClientStorage (localStorage, packages/types)
isStaticMode() === false      ->  REST API (Express, /api/*)
```

Static mode is active when `VITE_STATIC_MODE=true` or hostname contains `github.io`.
The `StorageAdapter` class in `apps/web/src/lib/storage-mode.ts` abstracts the difference.

## React Application Structure

```
apps/web/src/
  main.tsx              -- entry, mounts App
  App.tsx               -- QueryClientProvider, TooltipProvider, Router, PixelPresence
  pages/                -- route-level components (one file per route)
  components/
    babylon/            -- Babylon.js scene components
    lesson/             -- Dual-language lesson UI
    ui/                 -- shadcn/ui primitives (Radix-based)
    wizard-*            -- Pixel wizard subsystem
    pygame-*            -- Legacy Pygame simulation layer
  lib/
    asset-library/      -- Asset loading and caching
    grading/            -- Code grading engine (AST + runtime rules)
    javascript/         -- JS runner utilities
    pygame-components/  -- Pygame component templates
    python/             -- Python runner utilities
    [utilities]         -- error tracking, persistence, health monitor, etc.
  hooks/                -- custom React hooks
  types/                -- app-local types not in packages/types
```

## Wizard Subsystem

The wizard is the primary user experience. It uses a Yarn-dialogue-style engine:

```
UniversalWizard
  -> wizard-dialogue-engine   -- parses flow JSON, manages scene state
  -> wizard-option-handler    -- renders A/B choice buttons, continues flow
  -> wizard-layout-manager    -- device-responsive layout (phone/tablet/desktop)
  -> pixel-presence           -- persistent Pixel mascot overlay across all routes
  -> PygameRunner             -- renders live Python game preview
  -> PygameWysiwygEditor      -- drag-and-drop game component editor
  -> AssetBrowserWizard       -- asset picker for sprites, sounds
```

Flow JSON files drive the dialogue tree. Each node has: message, options, actions.
The `transitionToSpecializedFlow` action is intended to swap in a game-type-specific
flow file but is currently not wired to dynamic import logic.

## Babylon.js Integration

Uses Reactylon for declarative scene management:

```
BabylonCanvas (apps/web/src/components/babylon/BabylonCanvas.tsx)
  -- sets up engine, scene, camera (ArcRotateCamera), lights, shadows, optional physics (Havok)
  -- post-processing: bloom, FXAA, chromatic aberration (optional)
  -- exposes scene via Reactylon's useScene() hook

DemoScene
  -- uses BabylonCanvas
  -- creates ground plane + rotating cube as demonstration
```

Custom hooks: `useGameLoop` (delta-time-capped frame updates), `useInput` (keyboard + pointer).

## Lesson Schema

Defined in `packages/types/src/lesson-schema.ts`:

```typescript
Lesson {
  supportedLanguages: Language[]
  previewCode: Record<Language, string>
  steps: LessonStep[]
}

LessonStep {
  implementations: Record<Language, LanguageCodeContent>
  tests: Test[]
  visualization?: BabylonVisualizationConfig
}
```

The `LessonConverter` in `packages/lesson-engine` provides automated Python to JavaScript
translation as a starting point for creating dual-language lessons.

## CI / CD

| Workflow | Trigger | Job |
|----------|---------|-----|
| `ci.yml` | push (main, develop), PR (main) | type-check, build |
| `deploy.yml` | push (main) | deploy |
| `claude-code.yml` | manual | AI agent task runner |

Note: CI currently uses `npm ci` instead of pnpm. This is a known mismatch that should be fixed.

## Data Flow Diagram

```
Browser
  +-- React SPA (Vite 6)
  |   +-- Wouter Router
  |   +-- TanStack Query (server state cache)
  |   +-- Zustand (client state)
  |   +-- localStorage (persistence)
  |
  +-- Pyodide (WebAssembly)
  |   +-- Python execution sandbox
  |
  +-- Babylon.js (WebGL)
  |   +-- 3D scene rendering
  |
  +-- Monaco Editor (CDN)
      +-- Code editing UI

Optional (non-static mode):
  +-- Express REST API
      +-- /api/lessons, /api/progress
```

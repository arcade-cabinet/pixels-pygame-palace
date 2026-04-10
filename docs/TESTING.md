---
title: Testing
updated: 2026-04-09
status: current
domain: quality
---

# Testing Strategy

## Overview

The project uses two testing layers:
1. **Unit/integration tests** — Vitest, per-package and in `apps/web`
2. **E2E tests** — Playwright, in `tests/e2e/`, targeting `localhost:5173`

## Running Tests

### Unit Tests

```bash
# All packages
pnpm test

# Watch mode (web app)
cd apps/web && npx vitest

# With coverage
cd apps/web && npx vitest run --coverage
```

### E2E Tests

Requires dev server running on port 5173.

```bash
# In one terminal
pnpm dev

# In another terminal
npx playwright test

# Critical suite only (~5 min)
npx tsx tests/e2e/run-comprehensive-tests.ts --critical

# High priority suite (~10 min)
npx tsx tests/e2e/run-comprehensive-tests.ts --high

# With visible browser (debugging)
npx tsx tests/e2e/run-comprehensive-tests.ts --headed

# Single spec file
npx playwright test smoke-tests.spec.ts
npx playwright test wizard-flow-tests.spec.ts

# Specific browser/device project
npx playwright test --project=desktop-chromium
npx playwright test --project=mobile-portrait
npx playwright test --project=tablet-landscape
```

## Test Directory Structure

```
tests/
  e2e/
    global-setup.ts             -- test initialization
    utils/
      error-detection.ts        -- runtime error monitoring
      wizard-actions.ts         -- wizard navigation helpers
    smoke-tests.spec.ts         -- basic page loads and error detection
    wizard-flow-tests.spec.ts   -- complete wizard interactions
    wysiwyg-editor-tests.spec.ts-- drag-drop editor functionality
    asset-browser-tests.spec.ts -- asset loading and browsing
    pixel-animation-tests.spec.ts-- mascot animation and minimize/restore
    lesson-demo-tests.spec.ts   -- lesson demo page
    run-comprehensive-tests.ts  -- test suite runner CLI
  test-utils.ts                 -- shared test helpers
  setup.ts                      -- global Vitest setup
  responsive-wizard.test.tsx    -- responsive layout tests
```

## E2E Viewport Coverage

| Project | Dimensions | Device type |
|---------|-----------|-------------|
| desktop-chromium | 1920×1080 | Desktop Chrome |
| desktop-firefox | 1920×1080 | Desktop Firefox |
| tablet-portrait | 768×1024 | iPad |
| tablet-landscape | 1024×768 | iPad landscape |
| mobile-portrait | 375×667 | iPhone 8 |
| mobile-landscape | 667×375 | Phone landscape |

## Unit Test Coverage Areas

### `tests/unit/` (legacy, per component)

- `dialogue-engine.test.ts` — Yarn dialogue loading, context management, user profile sync
- `pygame-components.test.ts` — component structure, variants, parameter validation
- `scene-generator.test.ts` — Python code generation, template replacement

### `tests/integration/`

- `component-execution.test.ts` — Python code execution in browser environment
- `asset-binding.test.ts` — asset path resolution and mapping
- `pyodide-fixture.ts` — helpers for testing Python/JavaScript interop

### In-component tests

- `apps/web/src/components/DualLanguageEditor.test.tsx` — dual-language editor
- `apps/web/src/hooks/usePythonSandbox.test.ts` — Python sandbox hook

## Error Detection in E2E

The error detection utility monitors:
- Vite error overlays (build/compile errors)
- Uncaught JavaScript runtime exceptions
- Failed module imports
- Failed network requests
- React component render errors

## Test ID Conventions

All interactive elements must have `data-testid` attributes:

```tsx
// Pattern: {action}-{target}
<button data-testid="button-select-jump">Jump</button>
<input data-testid="input-jump-force" />

// Dynamic elements: {type}-{description}-{id}
<div data-testid={`component-${component.id}-instance`}>
```

## Playwright Configuration

Config lives in `playwright.config.ts`. Key settings:
- `baseURL`: `http://localhost:5173`
- `actionTimeout`: 15s
- `navigationTimeout`: 30s
- `retries`: 2 in CI, 0 locally
- `screenshot`: on failure only
- `video`: retain on failure

## Test Fixtures

### Fake Pygame Module

`tests/fixtures/fake-pygame.py` provides a mock pygame implementation for testing Python
components without a real pygame installation in the browser.

### Pyodide Test Context

```typescript
const pyodideContext = await createPyodideTestContext();
const result = await testComponentExecution(pyodide, componentCode, setupCode);
```

## Coverage Reports

```bash
# Generate coverage report
cd apps/web && npx vitest run --coverage

# Reports appear in:
# - Terminal (text summary)
# - coverage/index.html (HTML)
# - coverage/coverage.json (JSON)
```

## Adding Tests for New Features

1. Write the test first (TDD).
2. Add `data-testid` attributes to all new interactive elements.
3. For new wizard flows: add a spec to `wizard-flow-tests.spec.ts`.
4. For new pages: add smoke tests to `smoke-tests.spec.ts`.
5. For new packages: add unit tests in the package's `src/__tests__/` directory.

## Known Test Gaps

- No performance benchmarks for Python execution time.
- No visual regression tests (screenshot comparison).
- No accessibility audit automation (axe integration not yet added).
- Mobile app (`apps/mobile`) has no tests.

---
title: Standards
updated: 2026-04-09
status: current
domain: technical
---

# Code and Quality Standards

## Non-Negotiable Constraints

- **Max 300 LOC per file** — any language, any file type. Split before you hit the limit.
- **No stubs, TODOs, or placeholder bodies.** These are bugs. Fix them or delete them.
- **No Strata, no React Three Fiber, no Astro.** All removed; do not re-add.
- **Biome only** for linting and formatting. Do not introduce ESLint, Prettier, or stylelint.
- **pnpm only** for package management. Do not commit `yarn.lock` or `package-lock.json`.
- **Conventional Commits always.** Prefix: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`,
  `perf:`, `test:`, `ci:`, `build:`.

## TypeScript

- Strict mode on. No `any` without a Biome suppression comment explaining why.
- Prefer Zod schemas at package boundaries. Validate external data, not internal types.
- Use `type` imports for type-only imports (`import type { Foo } from '...'`).
- Path aliases: `@/` maps to `apps/web/src/`, `@professor-pixel/*` maps to workspace packages.
- Composite builds (`references` in `tsconfig.json`) for all packages.

## React

- React 19 only. No class components.
- Wrap every route in an error boundary (`PageErrorBoundary`).
- Use `data-testid` attributes on all interactive elements following `{action}-{target}` pattern.
- Prefer named exports over default exports for components (exception: page-level route components).

## Styling

- Tailwind CSS 4 utility classes only. No `@apply` directives.
- No hardcoded pixel values in Tailwind classes where a scale token exists.
- Dark mode via CSS variables (`hsl(var(--token))`), not class toggling.

## Babylon.js

- Use Reactylon declarative API. Avoid imperative scene manipulation outside hooks.
- Scene setup (camera, lights, shadows, physics) belongs in `BabylonCanvas`, not in pages.
- Delta time must be capped in game loops to prevent spiral-of-death on tab restore.

## Python Execution

- All Python runs in Pyodide, client-side only. No server-side execution.
- Timeouts: default 5s for lesson code, configurable per lesson.
- Output must be truncated at a reasonable limit to prevent DOM flooding.
- `input()` must always be mocked — real blocking `input()` freezes the browser.

## Testing

- Write tests before implementing new features.
- Unit tests for pure logic (sandboxes, converters, stores).
- E2E tests for user-visible flows (wizard, lessons, navigation).
- All interactive elements must have `data-testid` attributes for E2E reliability.
- Playwright runs multi-resolution: desktop (1920×1080), tablet (768×1024), mobile (375×667).

## Asset Standards

- All assets in `assets/` must be CC0 or permissively licensed.
- Document the source and license in the asset commit message.
- Binary files (images, audio, fonts) must be tracked with Git LFS.
- Generated assets (Python/shell scripts in `assets/`) must be committed alongside outputs.

## Documentation

- All `.md` files in root and `docs/` require YAML frontmatter (`title`, `updated`, `status`,
  `domain`).
- `updated` must reflect the actual date of last substantive change.
- Session dumps, temporary notes, and conversation artifacts must not be committed.
- Obsolete docs must be updated in the same commit that changes the system they describe.

## CI Expectations

- `pnpm check` (TypeScript) must pass on all PRs.
- `pnpm lint` (Biome) must pass on all PRs.
- Playwright E2E tests run on pull_request — no branch filters.
- Never merge with failing CI. Never use `--admin` to bypass.

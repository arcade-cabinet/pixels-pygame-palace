---
title: State
updated: 2026-04-09
status: current
domain: context
---

# Current State

## What Is Done

### Core Platform (v1.0.0 — 2026-01-17)

- pnpm monorepo with layered packages: `types`, `config`, `core`, `python-sandbox`, `lesson-engine`
- React 19 + Vite 6 + Tailwind CSS 4 + Biome
- Babylon.js 8 integration with Reactylon — working 3D demo at `/babylon-demo`
- Pyodide 0.26.4 Python sandbox — runs Python in the browser, stdout captured, `input()` mocked
- JavaScript sandbox — isolated execution, `console.*` captured, `prompt()` mocked
- Dual-language lesson schema (Zod-validated, supports Python, JavaScript, TypeScript)
- `LessonConverter` — automated Python-to-JavaScript lesson translation
- UI components: LanguageSelector, DualLanguageCodeEditor, LanguageComparisonView
- Pixel mascot system — persistent overlay, minimizable, dialogue engine
- Universal wizard with multi-device layouts (phone portrait/landscape/desktop)
- Pygame simulation layer — interprets Pygame drawing commands on HTML5 canvas
- WYSIWYG game editor — drag-and-drop component placement
- Asset library system with CC0 game assets
- Session and preference persistence via localStorage
- Global error handling and health monitoring
- Playwright E2E test suite with multi-resolution coverage
- Vitest unit and integration test setup

## What Is Broken / Incomplete

### Blocking Issues

1. **`transitionToSpecializedFlow` is not wired up.**
   After game type selection in the wizard, Pixel delivers the intro message but the specialized
   flow JSON (e.g., `platformer-flow.json`) is never loaded. The wizard gets stuck.
   Fix: dialogue engine must detect this action and dynamically import the target flow file.

2. **CI uses `npm ci` not pnpm.**
   The repository uses a pnpm lockfile. The CI workflow (`ci.yml`) uses `npm ci`, which is
   incorrect. This should be changed to pnpm.

### Functional Gaps

3. **Monaco editor integration is incomplete.**
   The code editor uses a basic textarea in most places. Monaco is installed but not fully
   integrated into the lesson flow.

4. **Mobile app (`apps/mobile`) is a stub.**
   React Native + Expo scaffold exists but has no functional screens.

5. **TypeScript composite build errors (TS6305).**
   Non-blocking at runtime but present in `pnpm check`. Should be fixed to keep CI clean.

6. **Asset picker fatigue in wizard flows.**
   Multiple game flows present 3–8 consecutive asset selection screens with no A/B choice.
   These should be redesigned as themed bundle packs.

7. **Missing wizard scenes.**
   No death/respawn, pause menu, game-over screen, or level transition in any current flow.

8. **No lesson progress persistence across sessions.**
   Progress is stored in memory during a session but not persisted to localStorage on the
   lesson side (separate from wizard session state).

## What Is Next

Priority order based on user impact:

1. **Fix `transitionToSpecializedFlow`** — unlocks the entire wizard game-type flow.
2. **Fix CI to use pnpm** — makes the pipeline accurate.
3. **Bundle asset pickers into themed packs** — eliminates picker fatigue in wizard.
4. **Complete Monaco editor integration** — proper syntax highlighting in lesson editor.
5. **Fix TS6305 errors** — clean `pnpm check` output.
6. **Add missing wizard scenes** — death/respawn, pause, game-over, transitions.
7. **Convert existing single-language lessons to dual-language** using `convertLessonToDualLanguage()`.
8. **Add lesson progress persistence** to localStorage.
9. **Create Babylon.js lesson visualizations** for programming concept demonstrations.
10. **Implement mobile app** — functional React Native screens.

## Active Branch

`feature/1.0-modernization` — this branch has uncommitted modifications from the v1.0 work.
These should be committed and the branch merged before starting new feature work.

## Architecture Decisions Made

- Babel.js chosen over Three.js/R3F for 3D — better TypeScript support and Reactylon abstraction.
- Pyodide for Python execution — no server required, runs entirely in browser.
- Biome replaces ESLint + Prettier — unified tooling, faster.
- pnpm workspaces for monorepo — workspace protocol for local dependencies.
- Wouter for routing — lightweight, no React Router dependency overhead.
- Static mode auto-detection — supports GitHub Pages deployment without config change.

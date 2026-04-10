---
title: Changelog
updated: 2026-04-09
status: current
domain: technical
---

# Changelog

All notable changes to Professor Pixel's Programming Palace are documented here.

Format: [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Changed
- Standardized all documentation to project standards (CLAUDE.md, AGENTS.md, README.md,
  STANDARDS.md, docs/ARCHITECTURE.md, docs/DESIGN.md, docs/TESTING.md, docs/STATE.md)
- Deleted session dumps, playtest notes, and copied placeholder docs

## [1.0.0] — 2026-01-17

### Added
- pnpm monorepo structure with layered packages: `types`, `config`, `core`,
  `python-sandbox`, `lesson-engine`
- Babylon.js 8 integration via Reactylon — BabylonCanvas, DemoScene, useGameLoop, useInput
- Dual-language lesson system: Zod-validated schemas supporting Python, JavaScript, TypeScript
- Python sandbox via Pyodide 0.26.4 — stdout capture, input mocking, timeout protection
- JavaScript sandbox — isolated execution context, console capture, prompt mocking
- Lesson converter utilities: automated Python → JavaScript translation
- LanguageSelector, DualLanguageCodeEditor, LanguageComparisonView UI components
- Babylon.js demo page at `/babylon-demo` with rotating cube and physics
- New home page with feature cards and tech stack showcase
- Tailwind CSS v4 migration — updated all `@apply` directives and PostCSS config
- Biome replacing ESLint + Prettier for unified linting and formatting

### Changed
- React upgraded from 18 → 19
- Vite upgraded from 5 → 6
- TypeScript upgraded to 5.9.3
- All Strata (`@jbcom/strata`) imports removed
- All React Three Fiber (`@react-three/fiber`) dependencies removed
- All Astro framework references removed

### Fixed
- Tailwind CSS v4 compatibility: `@tailwind` directives replaced with `@import "tailwindcss"`
- PostCSS configuration conflict with `@tailwindcss/vite` plugin
- Border utility classes updated to explicit CSS across 4 component files

## [0.1.0] — 2025-12-08

### Added
- Initial repository setup from jbcom-control-center scaffolding
- GitHub Actions workflows: CI, deploy, docs, Claude Code
- Cursor rules for TypeScript, PR workflow, memory bank, CI
- Sphinx documentation structure (since replaced)
- Playwright configuration for multi-browser E2E testing
- Vitest configuration for unit and integration tests
- Universal wizard with Pixel mascot and dialogue engine
- Pygame simulation layer for in-browser Python game preview
- Asset library system with CC0 game assets
- Session persistence via localStorage

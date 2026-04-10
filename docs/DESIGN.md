---
title: Design
updated: 2026-04-09
status: current
domain: product
---

# Product Design

## Vision

Professor Pixel's Programming Palace teaches kids to program by letting them build real games.
The learning happens through making choices, seeing immediate results, and feeling like a game
designer — not sitting through lectures or completing worksheets.

## The Mascot: Pixel

Pixel is the heart of the experience. A cyberpunk-styled character who:
- Guides users through every decision with personality and excitement
- Celebrates progress and reacts to choices
- Is always visible — pinned to the corner of the screen, minimizable but never gone
- Speaks in plain language, never technical jargon

Pixel must always feel present, enthusiastic, and encouraging. Pixel never says "you got it wrong."
Pixel says "let's try another way!"

## Educational Philosophy

- **Concepts, not memorization.** The goal is understanding why, not reciting syntax.
- **No artificial gating.** All lessons are available from day one. Curiosity is respected.
- **Dual-language from the start.** Python and JavaScript teach the same idea differently.
  Seeing both side-by-side reveals the concept, not the language.
- **Immediate feedback.** Code runs in the browser the moment the student clicks run.
  No compile step, no setup, no waiting.
- **Build something real.** Every lesson results in working, interactive game code.

## User Experience Principles

### Conversational, Not Instructional

The wizard presents A/B choices, not blank slates. "Do you want your hero to jump floaty
or realistic?" is more engaging than "configure the jump physics." Each choice maps to real
code that gets generated invisibly.

### Progressive Complexity

The wizard handles the scaffolding. Early choices are high-level (game type, visual theme).
Later choices expose more mechanical decisions. The WYSIWYG editor unlocks only after
completing conversational mode — it is the "graduation" to more control.

### Scene-by-Scene Construction

Games are built section by section: Title Screen → Gameplay → End Credits. Users see
the game take shape progressively, not as a single overwhelming block of code.

### What It Is NOT

- Not a professional IDE. The code editor is a teaching tool, not a workspace.
- Not a memorization platform. No flashcards, no syntax drills.
- Not a multiplayer experience. Progress is personal and local.
- Not a gating machine. Nothing is locked behind a score or level.

## Visual Design

- **Warm, soft colors.** No harsh black/white contrast. The palette should feel playful,
  not clinical.
- **Efficient use of space.** Minimal empty areas. The wizard, preview, and code editor share
  the viewport deliberately.
- **Device-first layouts.** Three explicit layouts: phone portrait, phone landscape, desktop.
  Mobile is not an afterthought.
- **Accessible.** All interactive elements have ARIA labels. Focus is managed through the wizard
  flow. No color-only information.

## Game Types Supported

The wizard currently supports these game archetypes:
- Platformer
- RPG (turn-based and real-time)
- Dungeon crawler
- Racing
- Puzzle
- Space shooter

Each has a dedicated flow file with genre-specific A/B choices (movement systems, enemy behaviors,
level structures, visual themes).

## Known UX Problems (Active)

- **Asset picker fatigue.** Several game flows present 3–8 consecutive asset selection screens
  with no meaningful choice. These should be bundled into themed packs (e.g., "Forest Pack"
  vs "Desert Pack").
- **Missing scenes.** Death/respawn, pause menu, game-over screen, and level transitions are
  not present in any current flow.
- **Broken flow transition.** After game type selection, `transitionToSpecializedFlow` does not
  load the specialized flow file. The wizard gets stuck after the intro message.
- **No scene preview.** Users cannot see what they are building between stages.

## Success Criteria

A student using this platform should be able to:
1. Start the wizard with no prior experience and complete a game-building session in one sitting.
2. Run their generated Python code and see it execute immediately in the browser.
3. View the same concept expressed in both Python and JavaScript.
4. Feel proud of what they built — it should look and feel like a real game, not a toy.

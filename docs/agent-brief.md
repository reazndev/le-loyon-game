# Brief for build agents

Every subagent working on Le Loyon reads this first. Your task message adds your own scope.

## The project

A first-person PS1-style psychological horror game, set in the invented village of Leurs (canton of Fribourg) in November 1998. TypeScript, Three.js, Vite, and Electron in `/home/reazn/Projects/le-leyon-game`, on branch `main`. The user is away. Make every decision yourself, write it down where it belongs, and never ask questions.

## Read before you start

1. `docs/style.md`: the look and feel. Horror comes from anticipation, sound, figures at the edge of view, and long quiet stretches, as in the film Pulse (Kairo). Real reveals are rare.
2. `docs/engine.md`: how to run the game, the level kit API, dialogue, state, audio, and debug hooks. Use the kit; don't write raw Three.js in levels unless the kit lacks something.
3. `docs/script/00-overview.md`: the map, cast, flow, puzzles, items, flags, and dialogue convention. Then the script file for your area.
4. `docs/textures.md`: the texture names you can use. If you need a texture that doesn't exist, use a close existing one or a kit fallback and list the missing texture in your final reply. Don't generate images yourself.

## Rules

- **Stay in your paths.** Several agents work in this checkout at the same time. Only create or edit files in the paths your task names. If you need a change elsewhere, such as an engine fix, describe it in your final reply instead of making it. Exception: tiny additive exports needed to compile are allowed in `src/engine` and `src/game`, but say so in your reply.
- **Scenes register themselves.** Each area folder `src/levels/<area>/index.ts` exports `export const scenes: Scene[]`. `src/levels/index.ts` collects them with a glob, so don't edit it or `src/main.ts`.
- **Ids come from the script.** Scene ids, spawn names, flags, items, and dialogue node ids use the snake_case ids in `docs/script/00-overview.md`. Content data lives in `src/content/` and is written by the content agent; if it doesn't exist yet when you need it, import from the path the convention below gives and write a minimal local stand-in only if needed to compile, marked with `// stand-in until src/content lands`.
- **Content import convention.** `import { dialogues } from '../../content'` gives `dialogues[nodeId]: DialogueScript`. `import { documents } from '../../content'` gives `documents[id]: { title: string; pages: string[] }`. Items and flags are typed in `src/content/items.ts` and `src/content/flags.ts`.
- **Look at your work.** Use `npm run shot` to take screenshots of every scene you build, by day and night where both exist, and look at them. Iterate until they read as PS1 Silent Hill: dense fog, muted colors, low-poly shapes, nothing modern looking. Save your best ones to `docs/screenshots/<scene>-<day|night>.png`.
- **Checks before you finish.** `npx tsc --noEmit` clean, `npx vitest run` passing, `npm run build` passing. Add unit tests for any pure logic you write.
- **Code quality.** Small modules with one job, typed, no dead code, comments only where they explain why. Reuse kit and engine helpers before writing new ones. Fluent builders where they fit.
- **Writing.** Any text a player sees follows the script. Plain words, no em dashes, sentence case. The reporter has no name and no gender.
- **Commits.** Commit only your own paths: `git add <your paths> && git commit -m "<message>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`. If git says the index is locked, wait a few seconds and retry. Never use `git add -A`, never reset, stash, or check out other files. Don't push.

## Final reply

End with: what you built, the scene ids and spawn names, screenshot paths, check results, any stand-ins or engine changes you made, and anything missing.

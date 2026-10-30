# Build plan

The plan Claude follows to build the game without the user. If a session restarts or its context gets compacted, read this file first and continue at the first unchecked step.

## Rules for the unattended run

- The user left on 2026-10-30 and expects no questions. Claude makes every decision, records it in `docs/`, and moves on.
- **Usage.** Before each phase, run `python3 .orchestration/usage.py`. If the 5-hour window is at 85% or more, start `.orchestration/wait-for-usage.sh 60` as a background command and wait for it to finish (rerun it if it prints `STILL-BLOCKED`). If weekly usage reaches 97%, wait the same way until the weekly reset. Never let usage reach 100%.
- **Watchdog.** A T3 scheduled task (`scheduled-task:23232738-d5fa-498b-9c18-e6f574cd2d1c`) posts into this thread every 90 minutes. If a turn is already running, ignore the message. If the run had stopped, for example because of a rate limit, the message restarts it.
- **Models.** Claude Opus for every subagent. GPT is unavailable.
- **Images.** FLORA. Budget: about $4.50 of the $5.13 balance. Use FLUX 3 Image Klein (`t2i-flux-3-image-klein-t2i`, about $0.01 per image) for most textures, and GPT Image 2.5 (about $0.055) only for key images. Log every spend in `docs/assets.md`.
- **Parallel agents** work in separate directories so they don't overwrite each other. Only the orchestrator edits shared registration files.
- **Commits.** Commit after each finished step. No remote, no push.

## Architecture

| Path | Contents |
|---|---|
| `src/engine/` | Renderer, PS1 materials, fog, dither post-process, input (keyboard and gamepad), audio, collision, UI overlay |
| `src/game/` | Game state and flags, inventory, dialogue runner, save and load, scene manager, scare director |
| `src/levels/` | One folder per area: home, village, inn, church, cemetery, forest, bunker |
| `src/content/` | Dialogue, forum pages, notes, and grave texts as typed data |
| `src/desktop/` | The 90s computer: prologue desktop and the inn's dial-up forum |
| `electron/` | Electron main process |
| `tools/` | Texture filter script, screenshot script |
| `public/assets/` | Processed textures and audio |
| `docs/script/` | The full story script in prose, written before it becomes data |

Debug hooks: `?scene=<id>&time=<day|night>&flags=a,b` loads any scene directly, and `window.__game` exposes state for automated tests and screenshots.

## Steps

- [x] **0. Setup.** Git, usage scripts, watchdog, this plan.
- [ ] **1a. Engine core.** Vite, TypeScript, Three.js, Electron. 640x480 render with PS1 effects and fog. Tank controls on keyboard and gamepad. Collision, interaction prompts, dialogue box, inventory, flags, save, scene transitions, audio manager. A test room. Screenshot script. API notes in `docs/engine.md`.
- [x] **1b. Script.** Full story script in `docs/script/`, with fact-checked background on the Foreign Legion, Bosnia, Swiss law, Fribourg, and 1998 technology.
- [x] **1c. Texture pipeline.** Filter script, texture list, first FLORA batch. See `docs/textures.md`.
- [ ] **2. Areas.** Built in parallel: home and prologue computer; village and inn; church and cemetery; forest and bunker.
- [ ] **3. Systems.** Le Loyon sightings and scare director, procedural sound and ambience, night watchman and grave digging, the dial-up forum during the game.
- [ ] **4. Integration.** Script into content data, quest flow from start to all three endings, title screen, settings, save slots.
- [ ] **5. QA.** Automated playthrough of every ending, screenshot review of every area, performance check, bug fixes.
- [ ] **6. Packaging.** Linux AppImage and Windows build with electron-builder.
- [ ] **7. Report.** Final report to the user with screenshots.

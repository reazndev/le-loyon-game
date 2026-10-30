# Build plan

The plan Claude follows to build the game without the user. If a session restarts or its context gets compacted, read this file first and continue at the first unchecked step.

## Rules for the unattended run

- The user left on 2026-10-30 and expects no questions. Claude makes every decision, records it in `docs/`, and moves on.
- **Usage.** Before each phase, run `python3 .orchestration/usage.py`. If the 5-hour window is at 85% or more, start `.orchestration/wait-for-usage.sh 60` as a background command and wait for it to finish (rerun it if it prints `STILL-BLOCKED`). If weekly usage reaches 97%, wait the same way until the weekly reset. Never let usage reach 100%. While agents run, keep `.orchestration/guard.sh 88` running in the background; it exits with `ALERT` when the window passes 88%, and then the orchestrator cancels the least important running agent and waits for the reset. Start a new agent only when the window is under about 55%, or under 70% when the reset is less than an hour away.
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
- [x] **1a. Engine core.** Vite, TypeScript, Three.js, Electron. 640x480 render with PS1 effects and fog. Tank controls on keyboard and gamepad. Collision, interaction prompts, dialogue box, inventory, flags, save, scene transitions, audio manager. A test room. Screenshot script. API notes in `docs/engine.md`.
- [x] **1b. Script.** Full story script in `docs/script/`, with fact-checked background on the Foreign Legion, Bosnia, Swiss law, Fribourg, and 1998 technology.
- [x] **1c. Texture pipeline.** Filter script, texture list, first FLORA batch. See `docs/textures.md`.
- [x] **2. Areas.** Built in parallel by subagents, following `docs/agent-brief.md`.
  - Wave 1, started 2026-10-30 01:05 UTC: content data (`src/content`), desktop and prologue (`src/desktop`, `home`), characters, scares and patrol, forest and bunker.
  - Wave 1 done 01:50 local: content, characters/scares/patrol, forest/bunker. Desktop still running.
  - Wave 2: church and cemetery done 01:52 UTC. Started 02:52 UTC after the reset: village outdoors (square, Chassot and Yerly farms, Gremaud house outside), village interiors (inn, laiterie, garage, Gremaud kitchen), and an engine UI agent (document view, italics, subtitles, Polaroid camera, notebook, title screen, engine.md update).
- [x] **3. Systems.** Done inside wave 1 and 2 (characters, scares, patrol, desktop forum, camera). Leftovers are listed under step 4. Le Loyon sightings and scare director, procedural sound and ambience, night watchman and grave digging, the dial-up forum during the game.
- [ ] **4. Integration.** Known gaps from wave 1 to close here:
  - Done by the engine UI agent (`aad4ddc`): document view, italics, subtitles, Polaroid camera, notebook, title screen, engine.md.
  - Levels: switch dialogue-page documents to `ctx.readDocument(id)` (helper in `src/levels/forest_path/play.ts`), and add `photo:` targets from the item table.
  - Declare scene flags `lai_bell_draft`, `kit_clock_stop`, `gar_yannick_left`, `sat_in_confessional`, `dig_confirmed` in `src/content/flags.ts`.
  - Laiterie and garage are open at night; lock their doors from the square at night.
  - `src/content/paginate.ts` collapses repeated spaces, which breaks the column layout of Gremaud's diary.
  - Levels must use `checkStory()` or `holds()` for derived flags, and `doc_marc_notebook_restored` when `cupboard_restored` is set.
  - Replace any `// stand-in until src/content lands` code with real imports.
  - Sleep save: write save slot `sleep` when the reporter wakes in room 3; the cemetery's caught screen loads it.
  - Forest: swap distant cone trees for the `tree_spruce`/`tree_beech_bare` sprites where it helps; fill the forest and bunker `stageBeats` hooks with the scare director.
  - Missing beats: two old women after morning mass (day 2), barn roofline from the fork when `skipped_follow`, gravel footsteps on the cemetery path, `fort_phone_crank` flag.
  - Leave ending: nothing shows the ending screen after `driver_departure` (hook: `timetable()` in `src/levels/village_square/index.ts`).
  - Odile's kitchen must start at `odile_talk_2` or her entry table after the doorstep's "Come in. Wipe your feet."
  - Debug URL needs `day=` and `night=` counts.
  - Engine: spawning inside a building footprint gives a NaN position and stalls; check collision push-out.
  - Integration agents, started 03:35 UTC: story flow and playthrough (all levels except forest/bunker), forest and bunker polish, engine robustness and packaging.
- Step 4 scope: Script into content data, quest flow from start to all three endings, title screen, settings, save slots.
- [ ] **5. QA.** Automated playthrough of every ending, screenshot review of every area, performance check, bug fixes.
- [ ] **6. Packaging.** Linux AppImage and Windows build with electron-builder.
- [ ] **7. Report.** Final report to the user with screenshots.

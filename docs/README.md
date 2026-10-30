# Le Loyon docs

Notes from planning conversations. Each file covers one topic and records what we decided and what is still open.

- [Tech stack](tech-stack.md): engine, language, tools, and why we picked them.
- [Style](style.md): the PS1 look, camera, controls, and other feel decisions.
- [Story](story.md): premise, locations, flow, the three graves, endings, and open problems.
- [AI workflow](ai-workflow.md): which model does which job.
- [Build plan](build-plan.md): the steps of the unattended build and the rules for it.
- [Agent brief](agent-brief.md): shared rules for build subagents.
- [Engine](engine.md): how to run the game and the level kit API.
- [Textures](textures.md): texture pipeline, names, and FLORA spend.
- [Script](script/00-overview.md): the full story script, flow, puzzles, flags, and items.
- [Reference images](references/README.md): mood images for Le Loyon, the bunker, and the forest.
- [Reference: the CLI game](reference-cli-game.md): what the earlier text adventure had and what we keep.

## Conversation log

- **2026-10-29.** Chose a 90s Japanese horror / PS1 Silent Hill style for a game about the Swiss legend of Le Loyon. Must run on Linux and Windows. Claude writes the code, so we chose a code-first stack: Three.js, TypeScript, and Electron. Settled the feel: first person with tank controls, no combat, 640x480, English, keyboard and gamepad, 1 to 3 hours long. The setting and era wait for the user's lore.
- **2026-10-29.** The user shared a rough story draft and the earlier C# text adventure as inspiration. Recorded both and listed the plot problems to solve.
- **2026-10-30.** The user added reference images and set the atmosphere: psychological horror built on anticipation, Silent Hill style short-range fog, and sound such as crackling and random noises. The story draft is a suggestion we can change.
- **2026-10-30.** Added 90s and 00s J-horror as a main influence, Pulse above all, for its build-up and anticipation. Added three more reference images.
- **2026-10-30.** Settled the story frame. The legend is Le Loyon, the village is the invented Leurs, and the setting is the late 1990s. The player is an unnamed reporter who starts by browsing early web forums. Le Loyon is a real man of about 40 with PTSD from a war. All names become Swiss French. The game is co-op. Horror leans on anticipation and sudden movement with few reveals. Claude may generate textures with AI and filter them to the PS1 look.
- **2026-10-30.** Dropped co-op; the game is single player. Set the year to November 1998 and Le Loyon's war to Bosnia. Kept grave digging as a crime that can end the game, and the inn computer with dial-up as the in-game forum. Set the AI workflow: Claude Opus orchestrates, GPT models write story and generate images.
- **2026-10-30.** The user's GPT subscription is gone, so Claude Opus does all the work and FLORA makes images. The endings are decided: keep the secret, publish, or leave. The user handed over the build to run unattended; see the build plan.

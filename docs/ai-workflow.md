# AI workflow

Which model does which job. Updated 2026-10-30.

| Job | Model | Notes |
|---|---|---|
| Orchestration, planning, review | Claude Opus 5.5, medium effort | The main session. Splits the work, briefs subagents, and checks their results. |
| Story writing, code, research | Claude Opus subagents, effort chosen per task | The user's GPT subscription is gone, so Claude does everything. The user allows heavy use of the Claude subscription, within the usage rules in [build-plan.md](build-plan.md). |
| Images | FLORA | GPT image generation through Codex failed on 2026-10-30: the ChatGPT account has no image tool. Budget and costs are in [build-plan.md](build-plan.md) and [assets.md](assets.md). Every image goes through our PS1 filter script. |

## Rules for subagents

- Each subagent gets a full brief, since it doesn't see this conversation. Point it at the files in `docs/` it needs.
- Story writers must follow [story.md](story.md) and [style.md](style.md): Swiss French names, the unnamed player, November 1998, and horror built on anticipation.
- Claude reviews story text against the docs before it goes into the game.

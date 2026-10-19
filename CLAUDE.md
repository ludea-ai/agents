# CLAUDE.md — ludea-ai/agents (Ludea's agent system)

> Shared memory across sessions. Read README.md first: it describes the whole system.

- This repo is the **source of truth** of Ludea's agents (engine, catalogue, watchdog): definitions
  (`agents/`), procedures (`procedures/`), heartbeats (`status/`), installed IDs (`deployed.json`).
  What runs on claude.ai is installed from here with `/install-agents`; health with `/check-agents`.
- A session opened on this repo by the owner is usually for: checking the agents, repairing them,
  or changing what they do. Change the files, `node tools/agents.cjs check`, commit + push to `main`,
  then `/install-agents`.
- A session that IS an agent (its title is an agent's `title`) follows its prompt + procedure and
  ends with its heartbeat.
- **Public repo**: no secret, no personal data, no child's name — ever.
- **Communication with the owner (Jean-Louis)**: French, plain words, no jargon; cause → fix → what
  was tested and what was NOT. Questions to the owner: interactive (AskUserQuestion), in French.
  Everything written on GitHub is in English.
- Related repos: `ludea-ai/game-engine` (the engine + template, its inbox and batch PRs),
  `ludea-ai/nebula` (showcase + test bench), `ludea-ai/ludea-ai.github.io` (site + catalogue +
  publication requests), the games (`dr-smile`, `gta7`, `my-little-stable`, published copies).
- Scope: Encrine is a separate project — see README « Rules ».

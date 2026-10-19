# Ludea agents

The agent system that keeps [Ludea](https://ludea.ai/) running: everything needed to understand,
reinstall and repair it lives in this repo. What runs on claude.ai (sessions and scheduled tasks)
is only a copy of these files, installed with `/install-agents`.

| Agent | When (Paris) | Job | Procedure |
| --- | --- | --- | --- |
| **engine** | 03:55 | Engine inbox (issues on `ludea-ai/game-engine`) → one batch PR on `game-engine`, tried on the Nebula test bench → the owner's « OK » → merge → propagation to Nebula and every Ludea game | [`procedures/engine/triage-upstream.md`](procedures/engine/triage-upstream.md) |
| **catalogue** | 05:55 | Publication requests on `ludea-ai/ludea-ai.github.io` → review (child safety first) → the owner's « publie <jeu> » → reviewed copy served at `https://ludea.ai/<game>/` | [`procedures/catalogue/review-submission.md`](procedures/catalogue/review-submission.md) |
| **watchdog** | 07:10 | Did both agents really run last night? Silent if yes; otherwise one automatic re-run and a notification to the owner | [`procedures/watchdog/check-agents.md`](procedures/watchdog/check-agents.md) |

## How it works
- **One standing session per agent** on claude.ai, created from this repo (`create_session`), plus a
  **scheduled task bound to it** that posts the agent's prompt at its hour. The session keeps its
  context: the owner answers « OK » / « publie <jeu> » in it, and the agent acts right away.
- Each run **clones what it needs** (`add_repo` + clone, repos listed in `agents/<id>.json`), reads
  its procedure **from this repo**, does the job, sends the owner a French summary, and ends with a
  **heartbeat**: `status/<id>.json` committed here. The heartbeats are the run log.
- The **watchdog** reads the heartbeats every morning.

## Files
```
agents/<id>.json          what runs: title, schedule, repos (+ access), procedure, prompt file
agents/<id>.prompt.md     the exact prompt the scheduled task sends (never edited in claude.ai)
procedures/               what each agent does, step by step (+ the child-safety reviewer's brief)
status/<id>.json          heartbeats: last finished run of each agent (written by the agents)
deployed.json             IDs of the sessions + scheduled tasks installed right now (by /install-agents)
tools/agents.cjs          check | list | show <id> | status
.claude/skills/           /install-agents (install, repair, update) · /check-agents (health)
DEPANNAGE.md              runbook for the owner, in French: symptoms → cause → fix
```

## Rules
- **This repo is the source of truth.** Change an agent = edit its files here, commit, then
  `/install-agents`. Never edit a scheduled task's prompt in claude.ai by hand.
- **Public repo, no secrets**: no token, password or personal data — ever. IDs of sessions and
  scheduled tasks are not secrets.
- **The owner decides**: agents propose; nothing is merged or published without the owner's explicit
  « OK » / « publie <jeu> » (details in each procedure). GitHub texts in English, messages to the
  owner in French.
- Procedures are Ludea's only: they are not in the engine template, so they never reach a creator's
  game. Creators' tools (`/publish`, `/idea`, `/update`, report-upstream) live in the engine.
- **Scope**: Encrine (the owner's other project) is separate — never look at, check or change it
  from Ludea. When something built here could help Encrine, send a short note (what, why, where in
  our repos) to the Encrine main session (`session_01Uxi6vTyZY4CiKFDutfBqKC`, `send_message`);
  Encrine does the same for us, and we decide with the owner.

## Known pitfalls
- A scheduled task that **creates a new session on each fire** starts without the repos and without
  the GitHub tools: it stops in 30 s (night of 2026-10-19). Always a standing session + a bound task.
- In a Claude Code session, GitHub's GraphQL is blocked (`gh pr list`, `gh label list` fail): use the
  GitHub MCP tools or `gh api repos/…` (REST). Creating a repository is not allowed from a session
  (403): the owner creates it on github.com.
- Several WebKit test runs at once give false "world unresponsive" results: run them one at a time.

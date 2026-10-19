---
name: install-agents
description: Install, repair or update Ludea's agent system on the owner's claude.ai account from THIS repo — the standing session + scheduled task of each agent in agents/*.json (engine, catalogue, watchdog), with their exact prompts, then a setup check of each session and deployed.json. Run after any change to agents/ or a procedure's setup needs, or when the watchdog / the owner says an agent is broken or gone. Triggers: "/install-agents", "réinstalle les agents", "les agents ne tournent plus", "mets à jour les agents", "repair the agents".
---

# install-agents (this repo → the running agents)

This repo is the **source of truth**. A scheduled task holds only a **stub** (`node tools/agents.cjs
stub <id>`): it pulls this repo and runs `agents/<id>.prompt.md`. So:
- **changing what an agent does** = edit `agents/<id>.prompt.md` or its procedure, commit, push —
  the next run uses it, **nothing to reinstall**;
- **this skill** is for what lives on claude.ai: a missing/broken session or task, a new agent, a
  new schedule, a new stub.
claude.ai rule: a scheduled task's prompt can only be edited **from inside the session it posts
into** (`update_trigger` from elsewhere is refused). That is why the prompt is a stub that never
changes; a task whose stub must change is replaced (new session + task, old task disabled).

## 0. Tools
Needs the claude-code-remote tools: `list_triggers`, `create_session`, `create_trigger`,
`update_trigger`, `delete_trigger`, `fire_trigger`, `send_message`, `list_environments`
(ToolSearch "claude-code-remote" if not loaded; `get_session` / `list_events` too when present).
`node tools/agents.cjs check` must pass.

## 1. Read what should run, and what runs
- `node tools/agents.cjs list`, and for each agent `node tools/agents.cjs stub <id>` (the exact
  text of its scheduled task — pass it verbatim, never retyped).
- `deployed.json` (the IDs installed last time) and `list_triggers` (what really exists).

## 2. Per agent — keep what works, recreate what doesn't
**The session** (one standing session per agent):
- `deployed.json` has a session and it still exists, is not archived and not `failed` → keep it.
- Otherwise create one: `create_session` with `title` = the agent's `title`, `source_url` =
  `https://github.com/ludea-ai/agents`, `permission_mode: "auto"`, the same environment as this
  session (omit `environment_id`), and a SETUP-ONLY first prompt:
  « Setup check only — do NOT run the agent's job. Read /home/user/agents/agents/<id>.json; for each
  repo listed, call add_repo with its access, clone it under /home/user, and report in one line per
  repo: cloned / denied (with the exact reason). Then check that the GitHub MCP tools load
  (ToolSearch "github issue") and that `gh api repos/ludea-ai/agents` answers. Reply with the list. »
- **Never** use a scheduled task that creates a new session on each fire
  (`create_new_session_on_fire`): such sessions start WITHOUT the repos and the GitHub tools — that
  is what broke the night of 2026-10-19 (both agents stopped after 30 s).

**The scheduled task** (bound to that session):
- Exists in `deployed.json` and in `list_triggers`, its prompt equals the stub and its session is
  kept → keep it (`update_trigger` for `cron_expression` / `enabled` if they changed — allowed from
  here; its prompt is not).
- Otherwise `create_trigger` with `name` = title, `cron_expression` = `schedule`,
  `persistent_session_id` = the session, `prompt` = the stub, `initiation: "human_request"`.
- The task it replaces → `update_trigger enabled:false` (pausing is allowed from here); delete it
  only if the owner asks. Leave unrelated scheduled tasks of the account alone (other projects).

## 3. Check
- Wait for each NEW session's setup reply (`list_events` when available, or ask the owner to look):
  every repo `cloned`, no `denied`. A denial → the owner must grant that repo (read
  `read_documentation` topic `github.access` and relay its steps) — say exactly which.
- `node tools/agents.cjs status` → heartbeats. Don't fire a full run just to test, unless the owner
  asks (it does real work: issues, PRs, publications).

## 4. Record
Rewrite `deployed.json` (`installedAt`, `installedBy: "install-agents (<this session id>)"`, per agent
`session`, `trigger`, `promptVersion` = the short git hash of this repo's HEAD), commit
`Install agents: <what changed>`, push. Then tell the owner in French: what was created / updated /
kept, the next run times, what was NOT verified.

## Guard-rails
- Only this repo's agents; never touch the account's other scheduled tasks or sessions.
- Never put a secret (token, password) in this repo — it is public.
- Never archive a session that holds an unanswered owner question (a batch PR or a publication
  waiting for « OK » / « publie … ») without telling the owner: they would answer in the wrong place.

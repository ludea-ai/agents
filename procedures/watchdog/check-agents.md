# check-agents — the watchdog's procedure (and the manual health check)

Answers one question every morning: **did each nightly agent really run, and is the system
still installed?** Used by the watchdog agent (07:10 Paris) and by the `check-agents` skill when
the owner asks « est-ce que les agents tournent ? ».

## 1. Heartbeats (the proof a run finished)
`git pull` in `/home/user/agents`, then read `status/engine.json` and `status/catalogue.json`.
Every run of these agents ends by writing its heartbeat (their procedures, last section).
- `date` = today (Paris) → it ran. Note `result` (`ok`, `nothing-new`, `blocked`, `error`) and
  `waitingForOwner`.
- Missing or older than today → **no finished run last night**.

## 2. Installation (is it still wired?)
- `list_triggers` (claude-code-remote MCP): the triggers named in `deployed.json` exist, are
  `enabled`, have no `ended_reason` / `suspension_reason`, and their `last_run.fired_at` is today
  for the night ones. A trigger missing, disabled or suspended = the installation is broken.
- If a `get_session` tool is available (ToolSearch "get_session"): the sessions in `deployed.json`
  exist, are not archived, and their `status_bucket` is not `failed`.

## 2b. Engine updates left half-way (the daytime blind spot)
After the owner's « OK », the engine agent merges the batch and updates every Ludea game during the
day — outside the nightly runs that §1 checks. If that stops half-way (session cut, a red check),
some games keep the old engine and nobody says so. Check it every morning, read-only — the repos are
public, so the GitHub MCP tools, `gh api` (REST) or plain `curl` all work:
- `https://api.github.com/repos/ludea-ai/game-engine/pulls?state=closed&per_page=20` → the PRs
  labelled `upstream-batch`, merged (`merged_at` set) and NOT labelled `propagated`.
- One merged more than 3 hours ago (the nightly engine run, which retries propagation first,
  has already had its chance) = **late**. Its version is in its title (`Engine <version>: …`).
  For each Ludea game (`ludea-ai/nebula` + the `ludea-ai` repos in
  `ludea-ai/ludea-ai.github.io/catalogue.json`), read
  `https://raw.githubusercontent.com/ludea-ai/<repo>/main/.claude/skills/_shared/engine-manifest.json`
  → `version`: the games still below the batch's version are the ones left behind.
- No re-run here (the engine agent already retried at night): it is a problem to report (§3).

## 3. Act
- Everything fine → reply with one French line (« Agents Ludea : tout a tourné cette nuit. » +
  what waits for the owner, from `waitingForOwner`), no notification.
- An agent left no heartbeat but its trigger fired → **one** automatic re-run:
  `fire_trigger` with `text` = "Watchdog re-run: last night's run left no heartbeat in
  ludea-ai/agents/status — do the full run, then write the heartbeat." Never more than one
  re-run per agent per day (check `status/watchdog.json` → `reruns`).
- A late engine update (§2b) → notify the owner: which batch (PR link), which games already run it
  and which are still on the old engine, and where to answer — « dis \"termine la mise à jour du
  moteur\" dans la session Ludea – agent moteur (signalements) ».
- Trigger missing / disabled / suspended, session archived, or a heartbeat with `result: error`
  → no repair by yourself beyond the one re-run: notify the owner (French, plain words) with the
  cause and the fix — usually « ouvre une session sur ludea-ai/agents et lance /install-agents »
  (DEPANNAGE.md).

## 4. Heartbeat of the watchdog itself
Write `status/watchdog.json` —
`{ "agent": "watchdog", "date": "<YYYY-MM-DD Paris>", "checkedAt": "<ISO UTC>", "engine": "<ok|missing|error|…>", "catalogue": "<…>", "propagation": "ok" | "late: game-engine#<n> (<games left>)", "reruns": ["engine"?], "notified": true|false }`
— commit `Watchdog <date>: <engine>/<catalogue>` and push to `main`.

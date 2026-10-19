---
name: check-agents
description: Tell whether Ludea's agents (engine, catalogue, watchdog) are installed and actually ran — heartbeats in status/, scheduled tasks, sessions — and what waits for the owner. Read-only unless something is broken (then propose /install-agents). Triggers: "/check-agents", "est-ce que les agents tournent ?", "les agents ont tourné cette nuit ?", "agent status".
---

# check-agents (manual health check)

Follow `procedures/watchdog/check-agents.md` §1–2 (heartbeats, then installation), but **do not
re-run anything and do not write the watchdog's heartbeat** — this is the owner's question, not the
morning run. Answer in French, plain words, one line per agent:
- ran last night or not (date, result), what waits for the owner (`waitingForOwner`), where to
  answer (the agent's session title);
- anything broken → what and the fix (usually `/install-agents`, see `DEPANNAGE.md`).

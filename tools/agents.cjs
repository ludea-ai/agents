#!/usr/bin/env node
/*
 * agents — read and check the agent definitions of this repo (agents/*.json + their prompts).
 *
 *   node tools/agents.cjs check            # every definition is complete; files it points to exist
 *   node tools/agents.cjs list             # id, title, schedule, procedure
 *   node tools/agents.cjs show <id>        # the full definition + its full instructions
 *   node tools/agents.cjs status           # last heartbeat of each agent (status/*.json)
 *   node tools/agents.cjs stub <id>        # the short prompt stored in the scheduled task
 *
 * The scheduled task never holds the real prompt: it holds a STUB that clones this repo and runs
 * agents/<id>.prompt.md. So changing what an agent does = commit + push here, nothing to reinstall
 * (a task's prompt can only be edited from inside its own session — claude.ai's rule).
 */
"use strict";
const fs = require("node:fs"), path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const ids = () => fs.readdirSync(path.join(ROOT, "agents")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const def = (id) => JSON.parse(rd(`agents/${id}.json`));

function stub(d) {
  return [
    `Scheduled run of the Ludea "${d.id}" agent — this is the owner's scheduled job, carry it out in full.`,
    ``,
    `1. Make sure ludea-ai/agents is cloned at /home/user/agents and up to date: if the folder is missing, call add_repo (owner "ludea-ai", repo "agents", access "push") and clone with the command it returns; otherwise \`git -C /home/user/agents pull --ff-only origin main\`.`,
    `2. Read /home/user/agents/${d.prompt} and do exactly what it says — it is your full instructions (they live in that repo so they can change without touching this scheduled task).`,
    `3. If step 1 fails, say so in French in your reply (« Agent ${d.id} : impossible de récupérer ludea-ai/agents — <raison> ») and stop.`,
  ].join("\n");
}

function check() {
  const problems = [];
  for (const id of ids()) {
    let d; try { d = def(id); } catch (e) { problems.push(`${id}: invalid JSON (${e.message})`); continue; }
    for (const k of ["id", "title", "schedule", "procedure", "workdir", "repos", "prompt"]) if (!d[k]) problems.push(`${id}: "${k}" missing`);
    if (d.id !== id) problems.push(`${id}: id "${d.id}" ≠ file name`);
    if (d.schedule && !/^CRON_TZ=[\w/]+ (\S+ ){4}\S+$/.test(d.schedule)) problems.push(`${id}: schedule must be "CRON_TZ=<zone> m h dom mon dow"`);
    for (const f of [d.procedure, d.prompt]) if (f && !fs.existsSync(path.join(ROOT, f))) problems.push(`${id}: ${f} not found`);
    (d.repos || []).forEach((r) => { if (!/^[\w.-]+\/[\w.-]+$/.test(r.repo) || !["read", "push"].includes(r.access)) problems.push(`${id}: bad repo entry ${JSON.stringify(r)}`); });
    if (!(d.repos || []).some((r) => r.repo === "ludea-ai/agents")) problems.push(`${id}: must list ludea-ai/agents (procedures + heartbeat)`);
  }
  const dep = JSON.parse(rd("deployed.json"));
  for (const id of ids()) if (!(id in dep.agents)) problems.push(`deployed.json: no entry for "${id}" (null until installed)`);
  console.log(problems.length ? "PROBLEMS:\n  - " + problems.join("\n  - ") : `agents OK (${ids().join(", ")})`);
  process.exitCode = problems.length ? 1 : 0;
}

const cmd = process.argv[2] || "list";
if (cmd === "check") check();
else if (cmd === "list") for (const id of ids()) { const d = def(id); console.log(`${id.padEnd(10)} ${d.schedule.padEnd(32)} ${d.title}  →  ${d.procedure}`); }
else if (cmd === "show") {
  const id = process.argv[3]; if (!id || !ids().includes(id)) { console.error("usage: show <" + ids().join("|") + ">"); process.exit(2); }
  const d = def(id); console.log(JSON.stringify(d, null, 2)); console.log("\n----- FULL INSTRUCTIONS (agents/<id>.prompt.md, read by the stub) -----\n" + rd(d.prompt).trim());
} else if (cmd === "status") {
  for (const id of ids()) {
    const f = path.join(ROOT, "status", id + ".json");
    if (!fs.existsSync(f)) { console.log(`${id.padEnd(10)} no heartbeat yet`); continue; }
    const s = JSON.parse(fs.readFileSync(f, "utf8"));
    console.log(`${id.padEnd(10)} ${s.date || "?"}  ${s.result || s.engine + "/" + s.catalogue}  ${s.summary || ""}`);
  }
} else if (cmd === "stub") {
  const id = process.argv[3]; if (!id || !ids().includes(id)) { console.error("usage: stub <" + ids().join("|") + ">"); process.exit(2); }
  console.log(stub(def(id)));
} else { console.error("commands: check | list | show <id> | status | stub <id>"); process.exit(2); }

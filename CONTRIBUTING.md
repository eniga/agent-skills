# Contributing

This repo is a pack of [agent skills](https://agentskills.io/) for the software
development lifecycle. Each skill is a self-contained directory under `skills/`
with a `SKILL.md` that an AI coding agent follows as a workflow.

## Quick start

```bash
npx skills add eniga/agent-skills --list     # browse before installing
npx skills add eniga/agent-skills --all      # install all skills, no prompts
npx skills add eniga/agent-skills --skill spec   # install one skill
```

Skills install to any of the 79 agents the
[skills CLI](https://github.com/vercel-labs/skills) knows, by id: `claude-code`,
`github-copilot` (this is how VS Code is covered — there is no `vscode` id),
`pi`, `opencode`, `cursor`, `codex`, and the rest. In Claude Code and Codex,
each installed skill also appears as a slash command named after its directory
(`/spec`, `/build`, ...). See `README.md` for the agent-id table.

## The lifecycle

The skills form one pipeline by convention. Each stage reads the artifacts of
the previous stage and writes its own — but no skill requires another to be
installed:

```
ORIENT    /context-prime   (verified repo map: facts cite files)
          /project         (the project docs set: init, list, summary)
INTAKE    /story-author ──▶ /story-triage
REFINE    /refine          (spec sketch + task breakdown + pointing)
DESIGN    /design          (how to build it, before what gets built)
DEFINE    /spec  ◀── /constraints ◀── /spec-amend (change control)
PLAN      /plan
BUILD     /build  ◀── /code-simplify (cross-cutting)
VERIFY    /test   ◀── /diagnose (cause before fix)
REVIEW    /review  ┊  /ai-code-review (fresh-context conformance check)
SHIP      /pr-prepare
RELEASE   /release         (observability + rollback proven, then watched)
```

The pipeline is a reading order for humans, **not a dependency graph**. Each
skill runs standalone against whatever artifacts exist.

## The traceability spine

Stable IDs flow through every artifact so any stage can prove what it did.
Skills must reuse these ID shapes — never invent new ones:

| ID shape | Meaning | Created by | Consumed by |
|---|---|---|---|
| `S-<n>` | Story | `story-author` | `story-triage`, `refine`, `spec`, `plan` |
| `AC-<n>` | Acceptance criterion (Given/When/Then) | `story-author` | `story-triage`, `spec`, `review`, `ai-code-review` |
| `NG-<n>` | Non-goal | `story-author`, `project` | `spec` (scope section), `review` |
| `R-<n>` | Spec requirement | `spec` | `refine`, `plan`, `build`, `test`, `review`, `ai-code-review`, `pr-prepare` |
| `TC-U<n>` / `TC-I<n>` / `TC-E<n>` | Test criterion: unit / integration / e2e, each mapped to an `R-<n>` | `spec` | `build` (tests are written from these, not from finished code), `test`, `review`, `ai-code-review`, `pr-prepare` |
| `T-<n>` | Task with story points | `refine` | `plan`, `build`, `pr-prepare` |
| `SL-<n>` | Build slice (distinct from story `S-<n>`) | `plan` | `build`, `test`, `pr-prepare` |
| `C-<n>` | Constraint (quality-bar rule) | `constraints`, `project` | `build`, `test`, `review`, `code-simplify` |
| `CX-<n>` | Verified context fact, citing a file | `context-prime`, `project` | `story-author`, `refine`, `design`, `spec`, `plan` |
| `AD-<n>` | Architecture decision | `design`, `project` | `spec`, `plan`, `review` |
| `PD-<n>` | Project document (architecture, PRD, plan, roadmap, …) | `project` | `project` (drift checks), reviewers |
| `AM-<n>` | Spec amendment | `spec-amend` | `plan`, `build`, `test`, `pr-prepare` |
| `D-<n>` | Defect with a proven cause | `diagnose` | `build`, `test`, `spec-amend`, `pr-prepare` |
| `RL-<n>` | Release check (observability, rollback, watch) | `release` | `pr-prepare`, `diagnose` |

Rules:

- IDs are assigned in order and never reused or renumbered. If a requirement
  is dropped, mark it `R-<n> (dropped: reason)` instead of deleting it, so
  traceability tables stay honest.
- Every `TC-*` must map to at least one `R-*`. Every `T-*` must map to at
  least one `R-*` (or `AC-*` when the spec does not exist yet).
- Findings, verdicts, and PR table rows cite IDs. A finding without an ID is
  a style note, not a finding.
- A `D-<n>` names the `R-*`, `AC-*`, or `TC-*` it violates, or states that no
  criterion covered the behavior — which is itself a finding.
- An `AM-<n>` records requirements as added, changed (before and after), or
  dropped with a reason. Amendments never renumber and never delete.
- A `CX-<n>` cites the file that proves it. An uncited claim belongs under
  Inferences, not Facts.
- A `PD-<n>` names one document in the project documentation set, and is
  recorded in that document's header. A refresh keeps its id and updates its
  **Last verified** stamp; it never renumbers. A removed document is marked
  `Superseded by PD-<n>` rather than deleted.

## Artifact home

Skills write artifacts into the **consuming repository** (the workplace repo
where the work happens), never into this skills repo:

```
<workplace-repo>/
  README.md                 # /project (front door: what it is, quick start)
  CONSTRAINTS.md            # written by /constraints (repo root)
  docs/                     # /project — PD-1 .. PD-10, the project docs set
    README.md               #   the index: what exists, ownership, freshness
    PRD.md                  #   product requirements
    ARCHITECTURE.md         #   system shape, structure, data, seams
    DESIGN.md               #   conventions and settled decisions
    CONSTRAINTS.md          #   the quality bar (pointer if root file exists)
    PLAN.md                 #   delivery plan and current state
    ROADMAP.md              #   technical now / next / later
    DEVELOPMENT.md          #   setup, run, test, debug
    DEPLOYMENT.md           #   build, environments, release, rollback
  .specs/<slug>/
    story.md                # /story-author
    sketch.md               # /refine (spec head-start)
    tasks.md                # /refine (breakdown + pointing)
    spec.md                 # /spec
    plan.md                 # /plan
    pr.md                   # /pr-prepare
    evidence/               # /test (command output, screenshots, traces)
                            # /release (release-<date>.md)
    defects/                # /diagnose (D-<n>.md)
    design.md               # /design
    context.md              # /context-prime (or .specs/context.md, repo-wide)
```

Two homes, two audiences. `docs/` is the project's documentation set — what the
system **is** — and `.specs/<slug>/` is the work record — what one change
**does**. A `docs/PLAN.md` is the project delivery plan; `.specs/<slug>/plan.md`
is the build order for one feature. They are different documents and never
replace one another.

`<slug>` is a kebab-case name for the feature, chosen once by `story-author`
and reused by every later stage. If the workplace repo already uses a spec
tool (OpenSpec, Kiro specs, etc.), keep that tool's artifact format and
storage; the skills own the content and the gates, the tool owns the
representation.

## Skill anatomy

Every `SKILL.md` follows the same shape. See `docs/skill-anatomy.md` for the
full spec.

```markdown
---
name: skill-name            # must match the directory name
description: <what it does, third person>. Use when <trigger 1>. Use when <trigger 2>.
---

# Skill Title

## Overview
## When to Use            (include "When NOT to use")
## Inputs                 (table: input | where | what to do if missing)
## Process                (numbered, specific, actionable)
## Templates              (the artifact shape, inline)
## Common Rationalizations (table: excuse → rebuttal)
## Red Flags
## Verification           (evidence checklist)
```

Hard rules:

- `name` is lowercase-hyphenated and **must equal the directory name**.
- `description` states what the skill does **and** when to use it. Max 1024
  characters. No process steps in the description — the agent may follow the
  summary instead of reading the skill.
- Keep `SKILL.md` under 500 lines. Move long templates into a `references/`
  directory **inside the skill** (skills must stay self-contained: a
  per-skill install via `--skill <name>` must work with nothing else).
- Every skill has an `## Inputs` table declaring what it reads, where, and
  **what to do when it is missing** — `Stop` with a reason, or `Proceed` with
  a named fallback. This table is what makes a skill independently usable.
- **Never name another skill.** Not in prose, not in a "run X first", not in
  a hand-off. The skills CLI installs skills individually and resolves no
  dependencies, so `--skill diagnose` must be complete on its own — a
  reference to a skill the user did not install points at nothing. Refer to
  the *artifact* (`.specs/<slug>/spec.md`) or the *activity* ("the
  verification pass") instead, and let the `## Inputs` table say what to do
  when the artifact is absent. CI fails the build on any backticked sibling
  skill name.
- Write the procedure, not the workaround: no steps that only exist because
  one model gets a call wrong.

## Adding a new skill

1. `mkdir skills/<name>` and write `SKILL.md` per the anatomy above.
2. Decide which traceability IDs it creates and consumes; update the table in
   this file if it introduces a new ID shape.
3. Add it to the lifecycle table in `README.md`.
4. Validate: `node .github/scripts/check-skills.mjs` must pass, and
   `npx skills add . --list` must show the new skill with a clean name and
   description.
5. Commit.

## Validation

CI (`.github/workflows/validate.yml`) runs on every push and pull request and
enforces two things:

1. `node .github/scripts/check-skills.mjs` — frontmatter parses, `name`
   matches the directory, the description is under 1024 chars and states a
   `Use when` trigger, `SKILL.md` is under 500 lines, code fences are closed,
   the required sections are present (including `## Inputs`), and **no skill
   names another skill**.
2. A real install (`npx skills add . --skill '*' --agent claude-code -y
   --copy --json`) reports every skill directory as `installed`.

Run both locally before pushing:

```bash
node .github/scripts/check-skills.mjs
npx skills add . --list          # eyeball the names and descriptions
```

If a skill is missing from the list, its frontmatter is invalid or its
directory name does not match its `name` field.

# Contributing

This repo is a pack of [agent skills](https://agentskills.io/) for the software
development lifecycle. Each skill is a self-contained directory under `skills/`
with a `SKILL.md` that an AI coding agent follows as a workflow.

## Quick start

```bash
npx skills add eniga/agent-skills            # install all skills
npx skills add eniga/agent-skills --list     # browse before installing
npx skills add eniga/agent-skills --skill spec   # install one skill
```

Skills install to 70+ agents (Claude Code, Cursor, Codex, Copilot, Cline, and
more) via the [skills CLI](https://github.com/vercel-labs/skills). In VS Code,
Claude Code, and Codex, each installed skill also appears as a slash command
named after its directory (`/spec`, `/build`, ...).

## The lifecycle

The skills form one pipeline. Each stage reads the artifacts of the previous
stage and writes its own:

```
INTAKE    /story-author ──▶ /story-triage
REFINE    /refine          (spec sketch + task breakdown + pointing)
DEFINE    /spec  ◀── /constraints (quality bar, set once, enforced everywhere)
PLAN      /plan
BUILD     /build  ◀── /code-simplify (cross-cutting)
VERIFY    /test
REVIEW    /review  ┊  /ai-code-review (fresh-context conformance check)
SHIP      /pr-prepare
```

## The traceability spine

Stable IDs flow through every artifact so any stage can prove what it did.
Skills must reuse these ID shapes — never invent new ones:

| ID shape | Meaning | Created by | Consumed by |
|---|---|---|---|
| `S-<n>` | Story | `story-author` | `story-triage`, `refine` |
| `AC-<n>` | Acceptance criterion (Given/When/Then) | `story-author` | `story-triage`, `spec`, `ai-code-review` |
| `NG-<n>` | Non-goal | `story-author` | `spec` (scope section), `review` |
| `R-<n>` | Spec requirement | `spec` | `refine`, `plan`, `build`, `test`, `review`, `ai-code-review`, `pr-prepare` |
| `TC-U<n>` / `TC-I<n>` / `TC-E<n>` | Test criterion: unit / integration / e2e, each mapped to an `R-<n>` | `spec` | `build` (tests are written from these, not from finished code), `test` |
| `T-<n>` | Task with story points | `refine` | `plan`, `build`, `pr-prepare` |
| `SL-<n>` | Build slice (distinct from story `S-<n>`) | `plan` | `build`, `test`, `pr-prepare` |
| `C-<n>` | Constraint (quality-bar rule) | `constraints` | `build`, `test`, `review` |

Rules:

- IDs are assigned in order and never reused or renumbered. If a requirement
  is dropped, mark it `R-<n> (dropped: reason)` instead of deleting it, so
  traceability tables stay honest.
- Every `TC-*` must map to at least one `R-*`. Every `T-*` must map to at
  least one `R-*` (or `AC-*` when the spec does not exist yet).
- Findings, verdicts, and PR table rows cite IDs. A finding without an ID is
  a style note, not a finding.

## Artifact home

Skills write artifacts into the **consuming repository** (the workplace repo
where the work happens), never into this skills repo:

```
<workplace-repo>/
  CONSTRAINTS.md            # written by /constraints (repo root)
  .specs/<slug>/
    story.md                # /story-author
    sketch.md               # /refine (spec head-start)
    tasks.md                # /refine (breakdown + pointing)
    spec.md                 # /spec
    plan.md                 # /plan
    pr.md                   # /pr-prepare
    evidence/               # /test (command output, screenshots, traces)
```

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
- Reference other skills by name (`follow the `test` skill`), never by
  copying their content.
- Write the procedure, not the workaround: no steps that only exist because
  one model gets a call wrong.

## Adding a new skill

1. `mkdir skills/<name>` and write `SKILL.md` per the anatomy above.
2. Decide which traceability IDs it creates and consumes; update the table in
   this file if it introduces a new ID shape.
3. Add it to the lifecycle table in `README.md`.
4. Validate: `npx skills add . --list` must show the new skill with a clean
   name and description.
5. Commit.

## Validation

Before publishing, run:

```bash
npx skills add . --list
```

Every skill must appear. If one is missing, its frontmatter is invalid or its
directory name does not match its `name` field.

# Agent Skills

A pack of 17 agent skills for the software development lifecycle: from an
unfamiliar repository and a vague feature intent to a merged, traceable pull
request. Each skill is a
structured workflow an AI coding agent follows — with templates, gates, and
exit criteria — so the same discipline applies whether a human or an agent is
driving.

The skills chain through a **traceability spine**: stable IDs (`AC-*` →
`R-*` → `TC-*` → `T-*` / `SL-*`) flow from the story through the spec, the
build, the tests, and into the PR description, so any stage can prove what it
did.

## Quick start

```bash
npx skills add eniga/agent-skills --list     # browse before installing
npx skills add eniga/agent-skills            # pick skills and agents interactively
npx skills add eniga/agent-skills --all      # install all 17, to every detected agent
npx skills add eniga/agent-skills --skill spec   # install one skill
```

Run bare, `skills add` prompts for which skills and which agents; `--all` is
the shorthand for "everything, no prompts" (`--skill '*' --agent '*' -y`).

The [skills CLI](https://github.com/vercel-labs/skills) knows 79 agents and
installs to any of them by id:

```bash
npx skills add eniga/agent-skills -g         # install globally (all projects)
npx skills add eniga/agent-skills -a claude-code -a cursor    # target agents
npx skills add eniga/agent-skills -a pi -a opencode -a github-copilot
```

| You use | Agent id | Skills land in |
|---|---|---|
| Claude Code | `claude-code` | `.claude/skills/` |
| VS Code (Copilot) | `github-copilot` | `.agents/skills/` |
| Pi | `pi` | `.pi/skills/` |
| OpenCode | `opencode` | `.agents/skills/` |
| Cursor, Codex, Zed, Windsurf, Gemini CLI, Cline, Amp, Droid, Warp, Replit, Kilo, … | `cursor`, `codex`, `zed`, … | `.agents/skills/` |

There is no `vscode` id — VS Code is covered by `github-copilot`. Agents that
share the universal `.agents/skills/` directory get one copy of each skill;
`claude-code` and `pi` are symlinked to it, so an update reaches every agent
at once.

In Claude Code and Codex, each installed skill also appears as a slash command
named after its directory (`/spec`, `/build`, ...).

> **Skill names are generic on purpose** — `plan`, `review`, `test`, `build`,
> `spec` read naturally as slash commands, but they can collide with a
> same-named skill from another pack, especially with `-g`. Check
> `npx skills list` before a global install, and prefer a project-level
> install when you already run another pack.

## The lifecycle

```
ORIENT    /context-prime   (verified map of the repo: facts vs inferences)
INTAKE    /story-author ──▶ /story-triage
REFINE    /refine          (spec sketch + task breakdown + pointing)
DESIGN    /design          (settle how to build it, before what gets built)
DEFINE    /spec  ◀── /constraints (quality bar, set once, enforced everywhere)
            ▲
            └─ /spec-amend (change control once the spec is approved)
PLAN      /plan
BUILD     /build  ◀── /code-simplify (cross-cutting)
VERIFY    /test   ◀── /diagnose (cause before fix, whenever something breaks)
REVIEW    /review  ┊  /ai-code-review (fresh-context conformance check)
SHIP      /pr-prepare
RELEASE   /release         (observability + rollback proven, then watched)
```

## All 17 skills

### Orient — learn the repository before trusting it

| Skill | What it does | Output |
|---|---|---|
| [`context-prime`](skills/context-prime) | Maps a repo into facts that cite files, with inferences labelled separately, so later stages stop guessing at existing behavior | `.specs/context.md` |

### Intake — turn intent into a story

| Skill | What it does | Output |
|---|---|---|
| [`story-author`](skills/story-author) | Feature intent → Jira-ready story with Given/When/Then ACs and explicit non-goals | `.specs/<slug>/story.md` |
| [`story-triage`](skills/story-triage) | Story → Ready / Not-ready / Blocked verdict + ranked gap list | verdict appended to `story.md` |

### Refine — size the work, sketch the spec

| Skill | What it does | Output |
|---|---|---|
| [`refine`](skills/refine) | Task breakdown with story points **and rationale**, plus a spec sketch that gives the spec author a head start | `.specs/<slug>/sketch.md`, `tasks.md` |

### Design — settle how to build it

| Skill | What it does | Output |
|---|---|---|
| [`design`](skills/design) | Real options compared against criteria written *before* the comparison; records the decision, what it gives up, and what would reverse it | `.specs/<slug>/design.md` or `docs/decisions/AD-<n>-*.md` |

### Define — fix what to build

| Skill | What it does | Output |
|---|---|---|
| [`spec`](skills/spec) | Full spec on a fixed template — context, scope/non-scope, interface & data contracts, behaviour, error/edge cases, test criteria split unit/integration/e2e, observability, rollback plan — gated on human approval before any code | `.specs/<slug>/spec.md` |
| [`constraints`](skills/constraints) | Sets the quality bar once: named rules with thresholds, the checking command, and the gate (editor / pre-commit / CI / nightly) | `CONSTRAINTS.md` (repo root) |
| [`spec-amend`](skills/spec-amend) | Changes an approved spec under control: the delta, re-approval, and the downstream slices, tests, and evidence it invalidates | change log in `spec.md` |

### Plan — decide the build order

| Skill | What it does | Output |
|---|---|---|
| [`plan`](skills/plan) | Approved spec → components, dependency order, parallelism, per-slice verification checkpoints, rollback position | `.specs/<slug>/plan.md` |

### Build & verify — implement and prove

| Skill | What it does | Output |
|---|---|---|
| [`build`](skills/build) | One vertical slice at a time; **tests generated from the spec's test criteria before the code**, not from finished code | code + tests, one commit per slice |
| [`test`](skills/test) | Focused tests for the change first, then the full suite; per-criterion pass/fail/unverified report with evidence | `.specs/<slug>/evidence/test-<date>.md` |
| [`code-simplify`](skills/code-simplify) | Clarity over cleverness; behavior-preserving simplification with Chesterton's Fence | simplified code + before/after note |
| [`diagnose`](skills/diagnose) | Cause before fix: reproduce, localize, one falsifiable hypothesis at a time, and a failing regression test as the deliverable | `.specs/<slug>/defects/D-<n>.md` |

### Review & ship — gate the merge

| Skill | What it does | Output |
|---|---|---|
| [`review`](skills/review) | Pre-merge quality review: correctness, security, regressions, proof, constraints; severity-labeled findings + verdict | review report |
| [`ai-code-review`](skills/ai-code-review) | PR diff + spec → conformance verdict (does the diff implement what was specified, no more and no less?) + comments mapped to IDs | conformance report |
| [`pr-prepare`](skills/pr-prepare) | Branch diff + spec → PR description with a traceability table (`R → T → commit → TC → evidence`) | `.specs/<slug>/pr.md` |

### Release — prove it is safe to ship and safe to undo

| Skill | What it does | Output |
|---|---|---|
| [`release`](skills/release) | Checks the spec's promised logs, metrics, and alerts actually fire; **rehearses the rollback** and times it; defines the watch thresholds before deploy | `.specs/<slug>/evidence/release-<date>.md` |

## How the skills chain

Skills chain through **artifacts, not through each other**. Each stage reads
files the previous stage wrote, all under `.specs/<slug>/` in the repository
where the work happens — so any stage runs on its own, against artifacts a
human or another tool produced:

```
context.md ──▶ story.md ──▶ sketch.md + tasks.md ──▶ design.md ──▶ spec.md
(context-prime)  (story-*)        (refine)            (design)     (spec)
                                                                     │
                     spec.md change log ◀── amendments ◀─────────────┤
                         (spec-amend)                                ▼
                                             code + tests ◀──── plan.md
                                                (build)          (plan)
                                                   │
                        defects/D-<n>.md ◀── when something breaks
                            (diagnose)                │
                                                      ▼
   pr.md ◀── review + ai-code-review ◀── evidence/ ◀── test
 (pr-prepare)                             (test)
      │
      ▼
  release-<date>.md   (observability verified, rollback rehearsed, then watched)
    (release)
```

No skill requires another to be installed. Each declares its inputs and what
to do when one is absent, so `--skill diagnose` on its own is a complete,
working skill.

The IDs that flow through:

| ID | Meaning | Created by |
|---|---|---|
| `S-<n>` | Story | `story-author` |
| `AC-<n>` | Acceptance criterion (Given/When/Then) | `story-author` |
| `NG-<n>` | Non-goal | `story-author` |
| `R-<n>` | Spec requirement | `spec` |
| `TC-U/I/E<n>` | Test criterion (unit / integration / e2e), each mapped to an `R-<n>` | `spec` |
| `T-<n>` | Task with story points | `refine` |
| `SL-<n>` | Build slice | `plan` |
| `C-<n>` | Constraint (quality-bar rule) | `constraints` |
| `CX-<n>` | Verified context fact (cites a file) | `context-prime` |
| `AD-<n>` | Architecture decision | `design` |
| `AM-<n>` | Spec amendment | `spec-amend` |
| `D-<n>` | Defect (with proven cause) | `diagnose` |
| `RL-<n>` | Release check | `release` |

The full convention — including the rule that tests are written from `TC-*`
before code exists, and that dropped requirements are marked, not deleted —
is in [CONTRIBUTING.md](CONTRIBUTING.md).

## Design principles

- **Process, not prose.** Every skill is a workflow with steps, gates, and
  exit criteria — not a reference doc.
- **Gates are explicit.** The spec is not built on until a human approves it;
  a slice is not done until its checkpoint passes; a PR is not prepared until
  the test report is current.
- **Evidence over assumption.** Every verification step names the command,
  the output, or the check that proves it. "Seems right" is never sufficient.
- **Anti-rationalization.** Each skill carries a table of the excuses agents
  use to skip its steps, with the rebuttal.
- **Self-contained, with no dependencies.** No skill names or requires
  another. Each carries its own templates and declares its inputs and its
  fallbacks, so `--skill <name>` installs something complete — the skills CLI
  does not resolve dependencies, so a skill that needed a sibling would be a
  skill that silently half-works. CI enforces this.
- **Model-neutral.** Skills state the procedure, not workarounds for one
  model's quirks.

## Repository structure

```
skills/                  # the 17 skills (one directory each, SKILL.md inside)
docs/skill-anatomy.md    # the per-skill file format spec
CONTRIBUTING.md          # pack conventions: traceability spine, artifact home
.github/workflows/       # CI: frontmatter, self-containment, real install
.github/scripts/         # check-skills.mjs, the anatomy validator
LICENSE                  # MIT
```

## Adding a skill

See [CONTRIBUTING.md](CONTRIBUTING.md) — the short version: create
`skills/<name>/SKILL.md` with valid frontmatter (`name` must match the
directory), follow the anatomy in `docs/skill-anatomy.md`, reuse the
traceability IDs, and run `node .github/scripts/check-skills.mjs` — the same
check CI runs.

## License

MIT — use these skills in your projects, teams, and tools.

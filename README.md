# Agent Skills

A pack of agent skills for the software development lifecycle: from a vague
feature intent to a merged, traceable pull request. Each skill is a
structured workflow an AI coding agent follows — with templates, gates, and
exit criteria — so the same discipline applies whether a human or an agent is
driving.

The skills chain through a **traceability spine**: stable IDs (`AC-*` →
`R-*` → `TC-*` → `T-*` / `SL-*`) flow from the story through the spec, the
build, the tests, and into the PR description, so any stage can prove what it
did.

## Quick start

```bash
npx skills add eniga/agent-skills            # install all 12 skills
npx skills add eniga/agent-skills --list     # browse before installing
npx skills add eniga/agent-skills --skill spec   # install one skill
```

The [skills CLI](https://github.com/vercel-labs/skills) installs into 70+
agents (Claude Code, Cursor, Codex, Copilot, Cline, and more). In VS Code,
Claude Code, and Codex, each installed skill also appears as a slash command
named after its directory.

```bash
npx skills add eniga/agent-skills -g         # install globally (all projects)
npx skills add eniga/agent-skills -a claude-code -a cursor   # target agents
```

## The lifecycle

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

## All 12 skills

### Intake — turn intent into a story

| Skill | What it does | Output |
|---|---|---|
| [`story-author`](skills/story-author) | Feature intent → Jira-ready story with Given/When/Then ACs and explicit non-goals | `.specs/<slug>/story.md` |
| [`story-triage`](skills/story-triage) | Story → Ready / Not-ready / Blocked verdict + ranked gap list | verdict appended to `story.md` |

### Refine — size the work, sketch the spec

| Skill | What it does | Output |
|---|---|---|
| [`refine`](skills/refine) | Task breakdown with story points **and rationale**, plus a spec sketch that gives the spec author a head start | `.specs/<slug>/sketch.md`, `tasks.md` |

### Define — fix what to build

| Skill | What it does | Output |
|---|---|---|
| [`spec`](skills/spec) | Full spec on a fixed template — context, scope/non-scope, interface & data contracts, behaviour, error/edge cases, test criteria split unit/integration/e2e, observability, rollback plan — gated on human approval before any code | `.specs/<slug>/spec.md` |
| [`constraints`](skills/constraints) | Sets the quality bar once: named rules with thresholds, the checking command, and the gate (editor / pre-commit / CI / nightly) | `CONSTRAINTS.md` (repo root) |

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

### Review & ship — gate the merge

| Skill | What it does | Output |
|---|---|---|
| [`review`](skills/review) | Pre-merge quality review: correctness, security, regressions, proof, constraints; severity-labeled findings + verdict | review report |
| [`ai-code-review`](skills/ai-code-review) | PR diff + spec → conformance verdict (does the diff implement what was specified, no more and no less?) + comments mapped to IDs | conformance report |
| [`pr-prepare`](skills/pr-prepare) | Branch diff + spec → PR description with a traceability table (`R → T → commit → TC → evidence`) | `.specs/<slug>/pr.md` |

## How the skills chain

Each stage reads the previous stage's artifacts and writes its own, all under
`.specs/<slug>/` in the repository where the work happens:

```
story.md ──▶ sketch.md + tasks.md ──▶ spec.md ──▶ plan.md ──▶ code + tests
   │              (refine)             (spec)      (plan)        (build)
   │                                                        │
   └────────────────────────────────────────────────────────┤
                                                            ▼
              evidence/ ◀── test ◀── review + ai-code-review ◀── pr.md
```

The IDs that flow through:

| ID | Meaning | Created by |
|---|---|---|
| `AC-<n>` | Acceptance criterion (Given/When/Then) | `story-author` |
| `NG-<n>` | Non-goal | `story-author` |
| `R-<n>` | Spec requirement | `spec` |
| `TC-U/I/E<n>` | Test criterion (unit / integration / e2e), each mapped to an `R-<n>` | `spec` |
| `T-<n>` | Task with story points | `refine` |
| `SL-<n>` | Build slice | `plan` |
| `C-<n>` | Constraint (quality-bar rule) | `constraints` |

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
- **Self-contained.** Every skill carries its own templates, so a per-skill
  install (`--skill <name>`) works with nothing else from this repo.
- **Model-neutral.** Skills state the procedure, not workarounds for one
  model's quirks.

## Repository structure

```
skills/                  # the 12 skills (one directory each, SKILL.md inside)
docs/skill-anatomy.md    # the per-skill file format spec
CONTRIBUTING.md          # pack conventions: traceability spine, artifact home
LICENSE                  # MIT
```

## Adding a skill

See [CONTRIBUTING.md](CONTRIBUTING.md) — the short version: create
`skills/<name>/SKILL.md` with valid frontmatter (`name` must match the
directory), follow the anatomy in `docs/skill-anatomy.md`, reuse the
traceability IDs, and confirm it appears in `npx skills add . --list`.

## License

MIT — use these skills in your projects, teams, and tools.

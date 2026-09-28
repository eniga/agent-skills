# Agent Skills

A pack of 18 agent skills for the software development lifecycle: from an
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
npx skills add eniga/agent-skills --all      # install all 18, to every detected agent
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
          /project         (the project docs set: init, list, summary)
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

## Running a change through the SDLC

The skills drive any change through the lifecycle: a feature, a bug fix, a
requirement change, or a refactor. Spec documents are **optional**. The
pipeline works the same whether or not a project keeps them.

### Two ways to drive it

| | Spec-driven | Context-driven |
|---|---|---|
| **When** | The project keeps spec documents: `.specs/<slug>/`, or its own tool's format (OpenSpec, Kiro, …) | The project has no spec documents, or doesn't use them |
| **Where expectations come from** | `story.md`, `spec.md`, `plan.md`, … | The conversation: the request, pasted tickets, earlier skill output in the same session, the code, and existing docs |
| **Where output goes** | Written to `.specs/<slug>/` | Returned in the conversation, and carried into commit messages and the PR body |
| **Traceability** | IDs (`AC-*`, `R-*`, `TC-*`, `SL-*`) resolve to files | Same IDs, assigned in the conversation and marked *context-sourced* |
| **Human gates** | Approval is recorded in the file (`Status: Approved`) | Approval is an explicit "yes" in the conversation, restated in the PR |

Each skill picks the mode itself. It looks for the spec documents first. When
they exist, it uses them. When they don't, it pulls the same details from the
context window, labels them as context-sourced, and stops only when the detail
it needs exists nowhere. At the end, a skill may offer to write what it
established into a spec file. Decline, and the work stays context-driven.

Context-driven work lasts as long as the session. For work that spans days or
people, or that needs an audit trail, spec documents are the durable record.

### 0. Once per repository (optional): orient and set the bar

| Step | Invoke | Give it | You get | Move on when |
|---|---|---|---|---|
| Map the repo | `/context-prime` | The purpose: "we're about to add OAuth to login" | A context map: `CX-*` facts that cite files, inferences labelled, hazards | The tests were run (or the failure is logged as a hazard) and every fact cites a file |
| Document the project | `/project init` (`list` shows drift, `summary` gives a brief) | The repo; answers to product and roadmap questions | `README.md` + `docs/` (`PD-1` … `PD-10`) | A human has accepted the set |
| Set the quality bar | `/constraints` | Your lint, type, test, and CI setup | `CONSTRAINTS.md` with `C-*` rules, commands, and gates | A human signed it off |

This stage is optional. Every later skill falls back to the repository's
existing lint, type, and test configuration when `CONSTRAINTS.md` is absent.

### 1. Define the change

| Step | Invoke | Give it | You get | Move on when |
|---|---|---|---|---|
| Write the story | `/story-author` | The raw intent: a sentence, a voice note, a ticket | A story: `S-*`, Given/When/Then `AC-*`, `NG-*` | The story has at least one failure-path AC and at least one non-goal |
| Check readiness | `/story-triage` | The story (file, ticket, or pasted text) | A verdict: Ready / Not ready / Blocked, with ranked gaps | The verdict is **Ready** |
| Size it | `/refine` | The ready story | A sketch (draft `R-*`, marked confirmed or assumed) + tasks (`T-*`, points, rationale) | Tasks are vertical and every point has a rationale |
| Decide the approach *(if open)* | `/design` | The problem plus whatever constrains it | A design record: options, criteria, the decision, and what it gives up | A reviewer accepted it. Skip this step when the approach is obvious and easy to reverse |
| Specify it *(spec-driven)* | `/spec` | The story, sketch, design, and constraints | `spec.md`: the fixed template, with every `R-*` covered by a `TC-*` | **A human explicitly approves it** |

In context-driven work, the story's `AC-*` (and the sketch's `R-*`, if you
refined) *are* the expectations. Confirm them in the conversation, then go
straight to stage 2.

### 2. Build, prove, and review

| Step | Invoke | Give it | You get | Move on when |
|---|---|---|---|---|
| Plan the order | `/plan` | The spec, or the ACs in context (+ tasks) | `SL-*` slices, dependency order, a checkpoint command per slice, the rollback position | Every slice delivers at least one requirement. Skip this step for single-slice work |
| Build slice by slice | `/build` | The plan and the expectations | One commit per slice (`feat(<slug>): … (SL-n, R-n)`), with tests written from `TC-*` **before** the code | Every slice's checkpoint is green and the full regression suite passes |
| Prove it | `/test` | The branch or diff | A per-criterion report: every `TC-*` marked pass, fail, or unverified, with the command and its output | The verdict is **Proven**, or each gap is named and accepted |
| Review quality | `/review` | The branch or PR | Findings by severity (each tied to an ID) and a verdict | No unresolved Blockers. Best run in a **fresh session** that didn't write the code |
| Check conformance | `/ai-code-review` | The diff plus the spec or stated intent | One matrix row per requirement, and a conformance verdict | No non-conformance is left unresolved. `/review` judges whether the code is good; `/ai-code-review` judges whether it's what was asked for |
| Open the PR | `/pr-prepare` | The branch, the expectations, the evidence, and the verdicts | A PR body with a table mapping each requirement to its commit, test, and evidence | The evidence covers the latest commit. The PR is opened but **not merged**; merging is a human call |

### 3. Ship and watch

| Step | Invoke | Give it | You get | Move on when |
|---|---|---|---|---|
| Release | `/release` | The merged change and its observability and rollback plan | A release record: signals checked to fire, rollback rehearsed and timed, watch thresholds, go/no-go | The decision is GO, the watch window has been observed, and the outcome is recorded |

### Loops that can interrupt any step

| When this happens | Invoke | Then |
|---|---|---|
| A test fails, something is flaky, or a bug is reported | `/diagnose` | You get a defect record (`D-<n>`) with the cause proven and a failing regression test. Fix it in a separate change, then rerun `/test` |
| Requirements change after they were agreed | `/spec-amend` | The change is recorded, re-approved, and the slices, tests, and evidence it invalidates are named. Rebuild and retest whatever it names |
| The code works but is hard to read (often a `/review` finding) | `/code-simplify` | The behavior is pinned by tests first, then simplified one concern at a time. Rerun `/test` afterwards |

### Paths by type of change

Enter the pipeline where the change needs it. Each skill states what it does
when an input is missing.

| Change | Spec-driven | Context-driven |
|---|---|---|
| **New feature** | `story-author` → `story-triage` → `refine` → (`design`) → `spec` → `plan` → `build` → `test` → `review` + `ai-code-review` → `pr-prepare` → `release` | `story-author` (ACs in chat) → `plan` if multi-slice → `build` → `test` → `review` → `pr-prepare` |
| **Bug fix** | `diagnose` (cites the `R-*` it violates) → fix → `test` → `review` → `pr-prepare` | `diagnose` (states expected vs actual from the report) → fix → `test` → `review` → `pr-prepare` |
| **Requirement change mid-flight** | `spec-amend` (change log in `spec.md`) → rebuild what it invalidated → `test` | `spec-amend` (restated list + amendment record in the conversation and PR) → rebuild → `test` |
| **Refactor / cleanup** | `code-simplify` → `test` → `review` | Same. It needs tests, not specs |
| **Unfamiliar codebase** | `context-prime` first, then any path above | Same |

Every skill finishes by showing you its full result and waiting. Nothing moves
to the next stage on its own. The human gates are never self-approved: triage
verdict, spec or requirement approval, re-approval of changes, merge, and the
release GO.

## All 18 skills

### Orient — learn the repository before trusting it

| Skill | What it does | Output |
|---|---|---|
| [`context-prime`](skills/context-prime) | Maps a repo into facts that cite files, with inferences labelled separately, so later stages stop guessing at existing behavior | `.specs/context.md` |
| [`project`](skills/project) | Reviews the whole project and writes or refreshes its documentation set — architecture, design, constraints, product requirements, development, deployment, plan, roadmap, and both READMEs — every claim citing a file. `list` reports the set and its drift from the code; `summary` gives the one-page brief | `README.md` + `docs/` (`PD-1` … `PD-10`) |

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

Skills chain through **artifacts, not through each other**. In spec-driven
work, each stage reads the files an earlier stage wrote: under
`.specs/<slug>/` for one piece of work, or in the project's `docs/` set for the
system as a whole. In context-driven work, the same artifacts live in the
conversation. Either way, any stage runs on its own, against artifacts that a
human, another tool, or an earlier turn produced. In spec-driven form, the
chain looks like this:

```
README.md + docs/ ──▶ context.md ──▶ story.md ──▶ sketch.md + tasks.md ──▶ design.md ──▶ spec.md
   (project)        (context-prime)  (story-*)        (refine)            (design)     (spec)
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
| `NG-<n>` | Non-goal | `story-author`, `project` |
| `R-<n>` | Spec requirement | `spec` |
| `TC-U/I/E<n>` | Test criterion (unit / integration / e2e), each mapped to an `R-<n>` | `spec` |
| `T-<n>` | Task with story points | `refine` |
| `SL-<n>` | Build slice | `plan` |
| `C-<n>` | Constraint (quality-bar rule) | `constraints`, `project` |
| `CX-<n>` | Verified context fact (cites a file) | `context-prime`, `project` |
| `AD-<n>` | Architecture decision | `design`, `project` |
| `PD-<n>` | Project document in the `docs/` set | `project` |
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
- **Specs are optional.** With spec documents, skills read and write them.
  Without them, skills work from the conversation and the code, mark what
  they pulled as context-sourced, and stop only when the detail they need
  exists nowhere. No skill creates a `.specs/` directory you didn't ask for.
- **Ends with the result.** Every skill presents its full result — artifact,
  verdict, evidence — before it stops. It offers a spec file only when the
  project already keeps them, at most once, and a spec it writes starts as
  `Draft`.
- **Code changes stay in scope.** Skills that edit code (`build`,
  `code-simplify`, `diagnose`'s regression test) change only what the task or
  request needs. Anything noticed elsewhere is reported as a follow-up.

## Repository structure

```
skills/                  # the 18 skills (one directory each, SKILL.md inside)
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

---
name: project
description: Produces a project's complete documentation set — architecture, design, constraints, product requirements, delivery plan, roadmap, development, and deployment guides — from verified repository evidence, then reports on it. Use when a project has no docs/ set. Use when existing documentation no longer matches the code. Use when asked to initialize, list, or summarize a project's documentation.
---

# Project

## Overview

Document what the project **is**, from what the repository **does**. This skill
has three modes:

| Mode | Purpose | Writes |
|---|---|---|
| `project init` | Review the whole project and generate the full documentation set | `docs/` (10 documents) + the front-door `README.md` |
| `project list` | Report every document that exists, what it owns, and how far it has drifted from the code | nothing |
| `project summary` | Give a one-page brief on what the project is | nothing |

Two rules define the skill.

1. **A document is a claim about the running system.** Every command printed in
   a document was executed before the document was written; every fact in every
   document cites the file that proves it, or is labelled an assumption.
2. **`init` writes documentation, never code.** Hazards discovered while
   surveying are recorded in the docs, not repaired in the same pass. A survey
   that edits is no longer a survey.

## When to Use

- A project has no `docs/` set, or only a stale `README.md`, and needs
  architecture, constraints, product, plan, roadmap, development, and
  deployment documentation.
- New contributors (or agents) keep re-deriving the same facts because nothing
  is written down, or because the docs describe a system that no longer exists.
- A handover, audit, or onboarding needs a written, citable account of the
  project as it stands today.
- Someone asks what the project is, and the honest answer is "read the code"
  (`project summary`).
- Someone asks which docs exist and whether they can be trusted (`project list`).

**When NOT to use:** The project is already documented and only one document is
wrong — edit that document; do not regenerate the set. You are documenting a
proposed system rather than an existing one (a design record for a change
belongs with the change). You want a decision recorded (that is a design
record, not project documentation). You are writing feature-level artifacts
for one piece of work (those belong under `.specs/<slug>/`). The repository is
a throwaway spike with a shelf life shorter than the documentation.

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The repository | the working directory | Stop. There is nothing to document. |
| The mode | the request — `init`, `list`, or `summary` | Proceed with `summary` and say so. It is read-only, so it is the only safe default; `init` rewrites files and is never assumed. If the request is a bare "document this project", treat it as `init`. |
| Existing documentation | `docs/`, `README.md`, root-level `.md` files, a docs site config | Proceed. For `init`, absence is the normal case. For `list`/`summary`, report that the set is absent and fall back to reading the repository directly. |
| A runnable project | install, build, test, and run commands from the manifest and CI config | Proceed, but every command you could not run is recorded as a hazard. A document written without running anything is inference wearing a suit. |
| Product intent, users, priorities, roadmap, ownership | a person — maintainer, product owner, or the request | Proceed for `list` and `summary`. For `init`, write the sections that need these as **open questions with owners**, never as invented content. A fabricated roadmap is worse than a missing one. |
| Git metadata | the repository's history and current revision | Proceed, and stamp documents with the date instead of a commit. Without a revision there is no drift detection later; say so in the doc header. |

## Process

Confirm the mode from the request, then follow that mode's steps. Do not blend
them: `list` and `summary` write nothing.

### Mode: `init`

1. **Agree the documentation home.** Default: `docs/` for the set, `README.md`
   at the repository root as the front door. If the repository already keeps
   documentation elsewhere, adopt that home. Never create a second docs tree.
2. **Read the cheap, load-bearing surfaces before the code.** Manifest and
   lockfile, language/runtime versions, build/test/lint/format configuration,
   the CI workflow, entry points, top-level directory layout, environment
   samples, container and infrastructure files. Record exact versions and
   exact commands, each with the file it came from.
3. **Reconcile what already exists, per file, before writing anything.**
   Classify each document as *absent* (write it), *present and current* (leave
   it; cite it), or *present and stale* (refresh it as a diff). A document that
   already lives at the repository root under a reserved name — `README.md`,
   `CONSTRAINTS.md`, `ARCHITECTURE.md` — is authoritative: the `docs/` entry
   becomes a short pointer, never a second copy. Show every rewrite as a diff.
   Never delete a human's paragraph without naming it.
4. **Run the project.** Execute install, build, the test suite, and the start
   command; record each command, its result, and its duration. This is what
   separates documentation from speculation, and a suite that does not run is
   the single most important fact in the set.
5. **Trace one real path end to end.** Pick the flow a new reader would care
   about most and follow it through the actual code: entry point → routing →
   handler → business logic → data access → response, naming the file at each
   hop. One traced path teaches the real layering; a directory listing does not.
6. **Map the structure, the data, and the seams.** Directory-by-directory
   responsibilities and ownership; where state lives and who else reads it;
   external APIs, auth, flags, background jobs, configuration and secrets,
   error handling, observability. Cite a file for each.
7. **Learn the conventions by reading, not assuming.** How this repository
   structures tests, handles errors, logs, names things, and splits modules —
   one real example per convention. A convention you cannot point at is a
   preference you brought with you.
8. **Build one fact ledger for the whole set.** Every factual claim resolves to
   a context fact (`CX-<n>`) citing `path:line`, or to an entry under open
   questions/inferences. Derive it once and reuse it across documents instead
   of re-deriving per document — that is what keeps the set consistent.
9. **Ask the human for what the code cannot answer.** Product intent, target
   users, non-goals, priorities, roadmap bets, deployment targets, ownership.
   Ask one question at a time, each with a recommended default drawn from the
   evidence. Record every answer with its source; leave the rest as open
   questions with owners.
10. **Write the documents in dependency order**, each from
    `references/<document>.md` in this skill:
    architecture → design → constraints → product requirements → development →
    deployment → plan → roadmap → docs index → front-door README. The two
    entry documents go last so they list files that exist.
11. **Stamp and cross-link.** Every generated document carries the doc header
    below. Internal claims link to the document that owns them instead of
    restating them. Where a document does not apply to this project (a
    60-line script needs no deployment runbook), say so in the index rather
    than shipping an empty template.
12. **Present the result, then propose the spec.** Show the full set in one
    place: the documents written, what was run, what failed, what is an open
    question, and which existing files were changed. Status is `Draft` until
    a human accepts it. Then, if the plan or roadmap names a concrete next
    piece of work and no spec file exists for it (`.specs/<slug>/spec.md`),
    ask whether to create one that captures that work's scope, requirements
    (`R-<n>`), and test criteria (`TC-*`). Write it only if the user agrees,
    and only from what the set actually established — anything still open
    goes into its open-questions section, not invented.

### Mode: `list`

1. **Locate the documentation home** the same way `init` would, and enumerate
   every document under it plus root-level docs.
2. **Parse each doc header** — id, path, what it owns, status, owner, the
   commit it was last verified against, and the paths it reads.
3. **Detect drift, not just presence.** For each document, check whether the
   paths under **Reads:** changed after the last-verified commit
   (`git diff --stat <commit>..HEAD -- <paths>`). Report the count of commits
   or files that touch the document's subject. A document whose subject changed
   and whose date did not is stale regardless of what its status field says.
4. **Report the standard set against reality**: which of the ten documents
   exist, which are missing, and which are marked not-applicable and why.
5. **Print the table and stop.** Write nothing, fix nothing, and do not offer
   to fix anything in the same pass.

### Mode: `summary`

1. **Prefer the written set.** If `docs/PRD.md`, `docs/ARCHITECTURE.md`, and
   the front-door `README.md` exist, summarise from them.
2. **Fall back to the code, and say so.** If the docs are absent, derive the
   brief from the repository directly and state plainly that no documentation
   set exists, so the reader knows the brief is unverified against a written
   source.
3. **Write the brief, not the manual.** One page: what it is, who it is for,
   what it does, how it works in a few sentences, current state, how to run and
   test it, and what is next. Cite a file for anything non-obvious, and flag
   any place the docs and the code disagree — the disagreement is itself the
   finding.

## The document set

Ten documents. Each owns a subject and must not restate another's; depth
scales with the project, but the ownership boundaries do not move.

| PD | Path | Owns | Must not duplicate |
|---|---|---|---|
| PD-1 | `README.md` (root) | Front door: what it is, who it is for, quick start, where to go next | Architecture depth, test strategy, deploy runbook — link out |
| PD-2 | `docs/README.md` | The index: every document, reading order, status, freshness | Document content; it is a map |
| PD-3 | `docs/PRD.md` | Problem, users, capabilities, non-goals, success measures | Implementation detail, task-level plan |
| PD-4 | `docs/ARCHITECTURE.md` | System shape, components, structure map, data, seams, one traced path, hazards | Product intent, roadmap |
| PD-5 | `docs/DESIGN.md` | Conventions and patterns with examples; design decisions (`AD-<n>`) and their rationale | The system inventory, the quality bar |
| PD-6 | `docs/CONSTRAINTS.md` | The quality bar: `C-<n>` rules, thresholds, checking commands, gates | Convention prose; every rule names its command |
| PD-7 | `docs/PLAN.md` | Delivery plan: milestones, sequencing, current state, next work, blockers | Now/next/later bets |
| PD-8 | `docs/ROADMAP.md` | Technical now/next/later, drivers, risks, revisit triggers | Committed dates presented as promises |
| PD-9 | `docs/DEVELOPMENT.md` | Prerequisites, install, configuration, run, seed, test commands by level, debugging, troubleshooting | The deploy procedure |
| PD-10 | `docs/DEPLOYMENT.md` | Build and artifact, environments, configuration and secrets, release steps, health checks, rollback, observability | The local development loop |

If a root-level `CONSTRAINTS.md` or `ARCHITECTURE.md` already exists, it is the
authoritative document and the `docs/` entry is a pointer to it.

## Doc header

Every generated document opens with this block. It is the only machine-readable
part of the set: `list` parses it, and **Reads:** is the drift surface.

```markdown
> **Doc:** PD-<n>
> **Status:** Draft | Current | Stale | Superseded by PD-<n> | Not applicable
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** <the paths this document was derived from>
```

## Templates

Every generated document is written from its own template. Load only the one
you are writing; each carries the section shape, what belongs in each section,
and the evidence rule for that document.

| Document | Template |
|---|---|
| Front-door README and docs index | `references/readme.md` |
| Product requirements | `references/prd.md` |
| Architecture and structure | `references/architecture.md` |
| Design and conventions | `references/design.md` |
| Quality bar | `references/constraints.md` |
| Delivery plan | `references/plan.md` |
| Technical roadmap | `references/roadmap.md` |
| Development and testing guide | `references/development.md` |
| Deployment guide | `references/deployment.md` |

`list` and `summary` write no files; their output shapes are these.

`project list` output:

```
## Documentation in <repo>

<docs home> — <n> documents, <n> missing from the standard set

| PD | Document | Owns | Status | Last verified | Drift since |
|---|---|---|---|---|---|
| PD-4 | docs/ARCHITECTURE.md | System shape and structure | Current | <date> @ <commit> | 3 commits touch <src path> |
| PD-9 | docs/DEVELOPMENT.md | Local development and testing | Stale | <date> @ <commit> | 41 files changed |

Missing: PD-<n> — <what it would cover>
Not applicable: PD-<n> — <the reason recorded in the index>
Unreadable: <documents with no doc header, or a header that does not parse>
```

`project summary` output:

```
# <Project name> — summary

<One paragraph: what it is, and the problem it solves.>

- For: <who uses it>
- Does: <the three to five capabilities that matter>
- Built with: <language, framework, versions> (<manifest>)
- State: <shipped / in progress / prototype> (docs/PLAN.md)
- Run it: <command> (docs/DEVELOPMENT.md)
- Test it: <command>
- Next: <the next milestone, one line> (docs/PLAN.md)

<How it works, in three to five sentences, naming the components and the path
a request or command takes.>

Sources: <which documents were read, or "no documentation set exists — derived
from the code".>
Disagreements: <where the docs and the code conflict, or "none found".>
```


## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The README is enough documentation" | A README answers "what is this and how do I start it". It cannot answer "why is this shaped this way", "what breaks at 3am", or "what are we doing next quarter". Readers who need those answers will read the code, slowly and wrongly. |
| "I'll describe the architecture I can see in the folder names" | Folder names describe the intent of whoever created them, which the code diverges from the same week. Trace the path and cite the files, or you are documenting a project that does not exist. |
| "The commands are standard, I don't need to run them" | The standard command is exactly the one the project customized and forgot to mention. A README whose quick start fails is worse than no README — it teaches the reader that the docs are unreliable. |
| "I'll write the roadmap from the TODOs and open issues" | TODOs are one engineer's notes from an unknown date. A roadmap states intent and priority, which only a human can supply. Ask; where nobody answers, write an open question with an owner. |
| "The old doc is wrong, I'll overwrite it" | The old doc often contains history the code no longer shows — why a decision was made, what was tried. Rewrite as a visible diff and let the human keep the parts that are still knowledge. |
| "A small project needs all ten documents too" | Ceremony, not documentation. Scale depth to the project and record which documents are not applicable and why. Ten empty templates are worse than three real ones. |
| "Documentation is done when the files exist" | It is done when a reader who has never seen the project can install it, run it, test it, and understand its shape using only the set. Test that by following your own quick start on a clean checkout. |
| "I found problems, so I'll fix them while I'm here" | Then the documentation is now describing code nobody specified or tested, and the diff mixes two changes a reviewer cannot separate. Record hazards in the docs; repair them deliberately in their own change. |
| "I'll add the last-verified stamp at the end, or skip it" | The stamp is the only mechanism that tells a future reader whether to trust the document and lets `list` report drift. Set it to the commit you actually verified against, not today's date. |
| "I'll write the summary without reading the docs, I remember the project" | Memory of a codebase goes stale the same way the docs do, and it cannot be cited. Read the documents and the files; say when they disagree. |

## Red Flags

- A factual claim with no file citation and no assumption label.
- A quick-start command that was never executed, or that fails.
- Architecture that matches a framework's documentation rather than this
  repository — no files cited, no traced path.
- A PRD, plan, or roadmap containing users, dates, or priorities nobody
  supplied.
- `docs/` duplicating a root-level document wholesale (two sources of truth).
- Existing documents overwritten or deleted without the user seeing the diff.
- Missing doc headers, or **Last verified** dated to today with no commit.
- Ten identical templates shipped for a project that needs four.
- An index or README listing documents that do not exist.
- Code changed during `init`.
- `list` or `summary` writing files, or `init` leaving documents half-written.

## Verification

- [ ] The documentation home was agreed, and no second docs tree was created.
- [ ] Each of the ten documents exists at its path, or its absence is recorded
      in the index with a reason.
- [ ] Every document carries the doc header, with a real commit in
      **Last verified** and real paths in **Reads:**.
- [ ] Install, build, test, and run commands were executed; results, durations,
      and failures are recorded.
- [ ] Every factual claim cites `path:line`, or appears as an assumption or an
      open question with an owner.
- [ ] At least one real execution path is traced end to end in the architecture
      document.
- [ ] Structure, data ownership, and seams each cite files.
- [ ] Conventions are each backed by a concrete example in this repository.
- [ ] The quality bar names a checking command for every rule.
- [ ] Product intent, roadmap, and ownership gaps are open questions, not
      invented content.
- [ ] No existing document was overwritten or deleted without the diff being
      shown.
- [ ] The front door and the index list exactly the documents that exist.
- [ ] No code was changed, and no hazard was fixed, during `init`.
- [ ] The set is `Draft` until a human accepts it, and anything not applicable
      is marked as such rather than stubbed.

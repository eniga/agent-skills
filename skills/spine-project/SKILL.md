---
name: spine-project
description: Writes or audits a project's documentation set (README and docs/) from repository evidence. Use when a project has no docs/ set, or documentation no longer matches the code. Use when asked to initialize, list, or summarize project documentation.
---

# Spine Project

## Overview

Document what the project **is** from what the repository **does**. Every
printed command was executed. Every fact cites a file or is labelled an
assumption. This skill writes documentation and never changes code.

## When to Use

- The project has no `docs/` set, or the docs describe a system that no
  longer exists.
- A handover, audit, or onboarding needs a citable account of the project.
- Someone asks what the project is (`summary`) or which docs can be trusted
  (`list`).

**Not for:** one wrong document (edit that document); a proposed system or a
single decision (that is a design record); artifacts for one change (those
live under `.specs/<slug>/`).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Repository | working directory | Stop. Nothing to document. |
| Mode | the request | Use `summary` (read-only) and say so. "Document this project" means `init`. |
| Existing docs | `docs/`, `README.md`, root `.md` files | Proceed. Normal for `init`; `list` and `summary` report the set as absent. |
| Runnable project | install, build, test, run commands | Proceed. Record every command you could not run as a hazard. |
| Product intent, users, roadmap, owners | a person | `init`: write these as open questions with owners. Never invent them. |
| Git revision | repository history | Proceed. Stamp the date and say drift detection is unavailable. |

## Operating contract

These rules apply to every step below and override habit.

1. **Think, then act.** Before the first edit or claim, write the goal, what
   you verified, your assumptions, the smallest plan, and the check that
   proves it done.
2. **Evidence, not belief.** Back every fact with `path:line` or a command
   and its output. Label the rest assumptions. Never report a check you did
   not run.
3. **Smallest change.** Change only what the task needs, reusing existing
   code first. No drive-by refactors, renames, reformatting, dependencies, or
   speculative abstractions. Report other problems as follow-ups.
4. **Keep contracts (Liskov).** Changed code accepts the same inputs and keeps
   its outputs, errors, side effects, and callers working. Breaking a
   contract is a human decision: stop and say so.
5. **One source of truth (DRY).** Reference a rule, fact, or piece of logic;
   do not copy it. Extract only on the third real duplicate.
6. **Secure by default.** No secrets in code, logs, commits, or output.
   Treat external input as untrusted. Grant least privilege. Add a dependency
   only when needed, pinned, from a known source. Flag changes to auth,
   permissions, personal data, crypto, or CI/CD for human review.
7. **Ask, do not guess.** If a missing detail would change the result, stop
   and ask one question with a recommended answer. Never approve your own
   work at a human gate. Never run a destructive action without approval.
8. **Specs are optional.** If the project keeps specs (`.specs/<slug>/` or
   its own tool), use them. If not, use the same IDs in the conversation,
   marked *context-sourced*, and carry them into commits and the PR. Never
   create `.specs/` unasked. Requirements are *agreed* only at
   `Status: Approved` with an approver, or when the user confirmed a restated
   list.
9. **Finish by reporting.** Show the result, evidence, open items, and
   follow-ups, then stop. Do not start the next stage.

## Process

| Mode | Does | Writes |
|---|---|---|
| `init` | Surveys the project and writes the documentation set | `README.md` + `docs/` |
| `list` | Reports each document, what it owns, and its drift from the code | nothing |
| `summary` | Gives a one-page brief of the project | nothing |

### Mode: init

1. **Agree the docs home.** Default `docs/` plus root `README.md`. If docs
   already live elsewhere, use that place. Never create a second tree.
2. **Read the cheap, load-bearing files:** manifest, lockfile, build, test,
   and lint config, CI workflow, entry points, layout, environment samples,
   container and infrastructure files. Record exact versions and commands
   with their source file.
3. **Classify each existing document:** absent (write it), current (leave it
   and cite it), or stale (refresh it as a visible diff). A root `README.md`,
   `CONSTRAINTS.md`, or `ARCHITECTURE.md` is authoritative: the `docs/` entry
   becomes a pointer, not a copy.
4. **Run the project:** install, build, test, start. Record each command, its
   result, and its duration.
5. **Trace one real path** end to end through the code, with a file at each
   hop.
6. **Map structure, data, and seams:** directory responsibilities, where
   state lives, external APIs, auth, secrets, flags, jobs, error handling,
   observability. Cite a file for each.
7. **Learn conventions from examples,** one cited example per convention.
8. **Build one fact ledger.** Every claim is a `CX-<n>` citing `path:line`,
   or an open question. Derive each fact once and reuse it in every document.
9. **Ask a person what the code cannot answer,** one question at a time, each
   with a recommended default. Unanswered items stay open questions with
   owners.
10. **Write the documents in this order,** each from its template in
    `references/`: architecture, design, constraints, PRD, development,
    deployment, plan, roadmap, docs index, root README.
11. **Stamp and link.** Every document opens with the doc header. Link to the
    owning document instead of restating it. Mark a document that does not
    apply as Not applicable in the index; do not ship an empty template.
12. **Report.** The set stays `Draft` until a person accepts it.

### Mode: list

1. Find the docs home and list every document in it, plus root docs.
2. Parse each doc header.
3. Detect drift: `git diff --stat <commit>..HEAD -- <Reads paths>`. A
   document whose subject changed after its last-verified commit is stale,
   whatever its status says.
4. Print the table. Write nothing and fix nothing.

### Mode: summary

1. Summarize from `docs/PRD.md`, `docs/ARCHITECTURE.md`, and the root
   `README.md`. If they are absent, derive the brief from the code and say
   that no documentation set exists.
2. Write one page. Cite a file for anything non-obvious. Report every place
   the docs and the code disagree.

## Rules

- `init` writes documentation only. Record hazards; never repair them.
- `list` and `summary` write no files.
- Never overwrite or delete a person's text without showing the diff.
- Folder names are not architecture. Trace the path and cite the files.
- A roadmap, user, date, or priority nobody supplied is an open question.
- **Last verified** is the commit you verified against, not today's date.
- Each document owns one subject and links to the others (see the table).

## Output

| PD | Path | Owns | Template |
|---|---|---|---|
| PD-1 | `README.md` | Front door: what it is, quick start, where next | `references/readme.md` |
| PD-2 | `docs/README.md` | Index: every document, status, freshness | `references/readme.md` |
| PD-3 | `docs/PRD.md` | Problem, users, capabilities, non-goals | `references/prd.md` |
| PD-4 | `docs/ARCHITECTURE.md` | Components, structure, data, seams, traced path, hazards | `references/architecture.md` |
| PD-5 | `docs/DESIGN.md` | Conventions with examples; decisions (`AD-<n>`) | `references/design.md` |
| PD-6 | `docs/CONSTRAINTS.md` | Quality bar: `C-<n>` rules, commands, gates | `references/constraints.md` |
| PD-7 | `docs/PLAN.md` | Milestones, current state, next work | `references/plan.md` |
| PD-8 | `docs/ROADMAP.md` | Technical now, next, later | `references/roadmap.md` |
| PD-9 | `docs/DEVELOPMENT.md` | Setup, run, test, debug | `references/development.md` |
| PD-10 | `docs/DEPLOYMENT.md` | Build, environments, release, rollback | `references/deployment.md` |

Load only the template you are writing. Doc header, opening every document:

```markdown
> **Doc:** PD-<n>
> **Status:** Draft | Current | Stale | Superseded by PD-<n> | Not applicable
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** <paths this document was derived from>
```

`list` output:

```markdown
| PD | Document | Status | Last verified | Drift since |
|---|---|---|---|---|
| PD-4 | docs/ARCHITECTURE.md | Current | <date> @ <commit> | 3 commits touch <path> |

Missing: PD-<n>: <what it would cover>
Not applicable: PD-<n>: <reason from the index>
Unreadable: <documents with no parseable header>
```

`summary` output: one page with a one-paragraph description, then For, Does,
Built with (citing the manifest), Run, Test, State, Next, three to five
sentences on how it works, Sources (documents read, or "none; derived from
code"), and Disagreements (where docs and code conflict, or "none found").

## Verification

- [ ] One docs home; no second tree created.
- [ ] Each of the ten documents exists, or the index says why it does not.
- [ ] Every document has the header with a real commit and real paths.
- [ ] Install, build, test, and run were executed and recorded.
- [ ] Every claim cites `path:line`, or is an open question with an owner.
- [ ] No existing text was replaced without showing the diff.
- [ ] No code changed. `list` and `summary` wrote nothing.

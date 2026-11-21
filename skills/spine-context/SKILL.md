---
name: spine-context
description: Maps how a repository actually works, with every fact citing a file. Use when starting work in unfamiliar code. Use when a story, spec, plan, or estimate would otherwise rest on assumptions about existing behavior.
---

# Spine Context

## Overview

Build a verified map of the repository before deciding anything against it.
**A fact cites a file, or it is an assumption.** The map is read-only: it
records hazards and does not fix them.

## When to Use

- Starting work in code you have not verified yourself.
- A story, spec, plan, or estimate rests on guesses about current behavior.
- Onboarding, or picking up a system nobody remembers.

**Not for:** a narrow question one file answers (read the file); a system that
does not exist yet; an area with a current map (read it and re-verify only
what your work touches).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Repository | working directory | Stop. Nothing to map. |
| Purpose: the decision the map supports | the request | Proceed with a general map and say so. |
| Existing docs | `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `CLAUDE.md`, ADRs | Proceed. Docs are claims to verify, not facts to copy. |
| A way to run it | test and build commands | Proceed. Record "nothing was run" as the first hazard. |

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

1. **Name the purpose** in one sentence. Go deep only where it points.
2. **Read the cheap, load-bearing files first:** manifest and lockfile, build,
   test, and lint config, CI workflow, entry points, top-level layout. Record
   language, framework, versions, and the run and test commands, each with
   its source file.
3. **Trace one real path** closest to the purpose, end to end: entry, routing,
   handler, logic, data access, response. Give `path:line` at every hop.
4. **Map the data.** For each store: what it holds, who writes it, who else
   reads it.
5. **Map the seams and trust boundaries.** External APIs, authentication and
   authorization, secrets and configuration, flags, background jobs, error
   handling, observability, and every place untrusted input enters. Cite
   where each is set up and one place it is used.
6. **Learn conventions from examples.** Tests, errors, logging, naming, module
   boundaries: one cited example each. List the existing helpers that new
   work should reuse.
7. **Run something:** the test suite or the application. Record the command,
   the result, and the duration.
8. **Record hazards with their consequence:** missing, slow, or failing tests;
   generated code; end-of-life or vulnerable dependencies; circular imports;
   a module everything imports; areas nobody owns.
9. **Split fact from inference.** Anything you did not read or run moves to
   Inferences, with what would confirm it.
10. **Write the map** using Output, then report.

## Rules

- Read-only. Change no file and fix no hazard.
- Recognizing a framework is not knowing this repository. Verify what this
  team did with it.
- Where the docs and the code disagree, the code wins. Record the
  disagreement as a fact.
- Map what the purpose needs, deeply. List what you skipped under Not
  surveyed.
- An empty Inferences table means something is mislabelled as a fact.

## Output

Save to `.specs/context.md` (or `.specs/<slug>/context.md` for one piece of
work), or return it in the conversation (contract rule 8).

```markdown
# Context map: <repository or area>

> **Date:** <YYYY-MM-DD> | **Commit:** `<sha>` (re-verify facts whose files changed since)
> **Purpose:** <the decision this map supports>
> **Verified by running:** `<command>`: <result, duration> (or: nothing was run)

## Shape
- **Language / framework:** <name, version> (`<file>`)
- **Entry points:** `<path>`: <what starts here>
- **Build / test / run:** `<commands>` (`<file>`)
- **CI:** <what runs on a PR> (`<file>`)

## Facts
| ID | Fact | Evidence |
|---|---|---|
| CX-1 | <what is true about this system> | `<path:line>` |

## Traced path: <flow>
1. `<path:line>`: <what happens>

## Data
| Store | Holds | Written by | Also read by |
|---|---|---|---|

## Seams and trust boundaries
| Boundary | Set up in | Used in | Untrusted input? |
|---|---|---|---|

## Conventions and reusable code
| Convention or helper | Example |
|---|---|

## Hazards
| # | Hazard | Consequence for work here | Evidence |
|---|---|---|---|

## Inferences (not verified)
| # | Inference | Why it seems true | What would confirm it |
|---|---|---|---|

## Not surveyed
<Areas left out, and why.>
```

## Verification

- [ ] The purpose is stated and the map's depth follows it.
- [ ] Versions, entry points, and commands each cite a file.
- [ ] One path is traced end to end with `path:line` at every hop.
- [ ] Data stores, seams, and trust boundaries cite files.
- [ ] Something was run and recorded, or the failure to run is hazard 1.
- [ ] Every fact has a `CX-<n>` and evidence; every guess is under Inferences.
- [ ] Not surveyed is filled in.
- [ ] No file was changed.

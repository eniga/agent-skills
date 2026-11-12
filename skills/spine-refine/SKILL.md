---
name: spine-refine
description: Breaks a ready story into vertical tasks with story points and a rationale for each, and drafts a spec sketch of proposed requirements, interfaces, and risks. Use when a ready story needs sizing before specification. Use when sprint planning needs a task breakdown and points.
---

# Spine Refine

## Overview

Size a ready story. Produce a **spec sketch** (draft `R-<n>` requirements,
rough interfaces, risks) and a **task breakdown** (`T-<n>` with points).
**Every point has a reason, and every task is a vertical slice.** This skill
does not write the spec, plan the build, or implement.

## When to Use

- A story is ready and the next step is specification.
- Sprint planning needs tasks and points.

**Not for:** a story that is not ready (fix it first); work that already has
a spec (plan the build instead); a single task (build it).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Ready story with `AC-*` and `NG-*` | `.specs/<slug>/story.md`, a ticket, the conversation | Stop if no outcome or criteria exist anywhere. If the story is thin, size what can be sized and list the rest as unknowns. |
| Repository context | the codebase | Proceed. Mark every estimate that rests on unverified code as assumed. |
| Pointing scale | team convention | Proceed with 1, 2, 3, 5, 8 and say so. |

## Operating contract

These rules apply to every step below. They override habit and convenience.

1. **Think, then act.** Before the first edit or claim, write down: the goal,
   what you verified, what you are assuming, the smallest plan, and the check
   that will prove it done.
2. **Evidence, not belief.** Read the code and run the command before stating
   a fact. Cite `path:line`, or the command and its output. Label everything
   else an assumption. Never report a check you did not run.
3. **Smallest change that works.** Change only what the task needs. Search for
   existing code to reuse before writing new code. No drive-by refactors,
   renames, reformatting, new dependencies, or speculative abstractions.
   Problems outside the task are reported as follow-ups, not fixed.
4. **Keep contracts substitutable (Liskov).** Whatever you change must still
   work everywhere the old version was used: accept at least the same inputs,
   keep the same outputs, errors, and side effects, and leave callers
   unchanged. If a contract must break, stop and say so. That is a decision
   for a human, not a detail.
5. **One source of truth (DRY).** Each rule, fact, and piece of logic lives in
   one place. Reference it; do not copy it. Do not merge code that only looks
   alike: extract on the third real duplicate of the same knowledge.
6. **Secure by default.** No secrets in code, logs, commits, or output. Treat
   external input as untrusted. Grant least privilege. Add or upgrade a
   dependency only when needed, pinned, from a known source. Flag any change
   to auth, permissions, personal data, crypto, or CI/CD for human review.
7. **Ask, do not guess.** If a missing detail would change the result, stop
   and ask one question with a recommended answer. Never approve your own work
   at a human gate. Never run a destructive or irreversible action without
   explicit approval.
8. **Specs are optional.** If the project keeps spec files (`.specs/<slug>/`,
   or its own spec tool), read and write them there. If not, work in the
   conversation with the same IDs marked *context-sourced*, and carry them
   into commits and the PR. Never create `.specs/` unasked. Requirements are
   *agreed* only when a spec says `Status: Approved` with an approver, or the
   user confirmed a restated list.
9. **Finish by reporting.** Show the full result (output, evidence, open
   items, follow-ups) and stop. Do not start the next stage. If the project
   keeps spec files and this work has none, offer once to write a `Draft`
   spec.

## Process

1. **Read the story and the code it touches.** If a triage verdict says Not
   ready or Blocked, stop and say so.
2. **Check the size.** Two shippable outcomes means two stories: stop and
   split.
3. **Find where the work lands.** Name the existing modules, interfaces, and
   helpers the story will reuse or change. Prefer extending what exists over
   adding something new.
4. **Write the sketch:** draft `R-<n>` marked `confirmed` (stated in the
   story) or `assumed` (your inference); rough interfaces; data questions;
   the top three to five risks, including security and data risks, each with
   a mitigation; open questions with recommended defaults.
5. **Break the story into tasks.** Each `T-<n>` delivers one observable piece
   end to end, fits one focused session, maps to an `AC-<n>` or `R-<n>`, and
   names its dependencies. Order by dependency.
6. **Point each task** and give one line of rationale:

   | Points | Means |
   |---|---|
   | 1 | One file, no unknowns, obvious test. |
   | 2 | A few files, one small unknown. |
   | 3 | Several files or one real unknown. |
   | 5 | Significant unknowns or integration surface. Split if you can. |
   | 8 | Too big to estimate. Split it, or make it a spike. |

7. **Check the total** against iteration capacity. If it is over, propose
   which tasks to cut or defer, citing the `AC-<n>` affected.
8. **Report.**

## Rules

- Tasks are vertical ("the retry endpoint works end to end"), never layers
  ("write the database layer").
- Points measure relative size and unknowns, not hours.
- A point without a rationale is a guess. Write the reason.
- A spike produces knowledge, not production code. Label it a spike.
- Sketch interfaces are hypotheses. Every `assumed` item is a question for
  the spec author.
- Never shrink the story silently to fit capacity.

## Output

Save to `.specs/<slug>/sketch.md` and `.specs/<slug>/tasks.md`, or return
both in the conversation (contract rule 8).

```markdown
# Spec sketch: <feature>

> **Slug:** <slug> | **Story:** S-<n> | **Date:** <YYYY-MM-DD>
> **Status:** Head start for the spec (not a spec)

## Lands in
- `<path>`: <reused or changed, and how>

## Proposed requirements
- **R-1 (confirmed):** <behavior stated in the story>
- **R-2 (assumed):** <inference to verify>

## Proposed interfaces
- <rough shape, and what is unknown>

## Data questions
- <data touched, its sensitivity, what is unknown>

## Risks
| # | Risk | Mitigation |
|---|---|---|

## Open questions
- <question> | recommended: <default>
```

```markdown
# Tasks: <feature>

> **Slug:** <slug> | **Story:** S-<n> | **Total points:** <sum>

| ID | Task | Maps to | Points | Rationale | Depends on |
|---|---|---|---|---|---|
| T-1 | <one observable piece> | AC-1 | 2 | <what makes it this size> | None |

## Notes
- <cut candidates, sequencing constraints, external dependencies>
```

## Verification

- [ ] The sketch is marked as a head start, not a spec.
- [ ] Every sketch requirement is `confirmed` or `assumed`.
- [ ] Every task maps to an `AC-<n>` or `R-<n>` and names its dependencies.
- [ ] Every task has points and a one-line rationale. No unsplit 8.
- [ ] Tasks are vertical and ordered by dependency.
- [ ] The total was checked against capacity.
- [ ] No spec, plan, or code was produced.

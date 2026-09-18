---
name: refine
description: Breaks a ready story into tasks with story points and rationale, and writes a spec sketch that gives the spec author a head start. Use when a story is triaged Ready and needs refinement before specification. Use when a story needs task breakdown and pointing for sprint planning.
---

# Refine

## Overview

Take a ready story and produce two artifacts: a **spec sketch** (a head start
for the spec author — proposed requirements, interfaces, and risks, not a
finished spec) and a **task breakdown with pointing** (tasks `T-<n>` with
story points and the rationale for each point). Refinement decides *how big*
the work is and *what the spec should cover*; it does not decide *how to
build it* (that is `plan`) and it does not write the spec (that is `spec`).

## When to Use

- A story is triaged Ready and the next step is `/spec`.
- Sprint planning needs a task breakdown and points for a story.
- A story is too big to spec in one pass and needs to be split.

**When NOT to use:** The story is not ready (run `story-triage` first —
refining a broken story wastes the refinement). The spec already exists (run
`plan` against it). The work is a single task (no breakdown needed — go
straight to `build`).

## Process

1. **Read the inputs.** Read `.specs/<slug>/story.md` (story, ACs, non-goals,
   triage verdict) and the relevant existing code. If the triage verdict is
   Not ready or Blocked, stop and say so — do not refine over known gaps.
2. **Check the size.** If the story contains two independently shippable
   outcomes, stop and split it into stories first (one story, one outcome).
   Refinement splits tasks within a story, not stories.
3. **Write the spec sketch** to `.specs/<slug>/sketch.md` using the template
   below. The sketch is a head start for the spec author:
   - **Proposed requirements:** draft `R-<n>` entries, one per behavior you
     can already see. Mark each `confirmed` (stated in the story) or
     `assumed` (your inference — the spec author must verify).
   - **Proposed interfaces:** the interfaces you expect the spec to need,
     with rough shapes. These are hypotheses, not contracts.
   - **Data questions:** the data the feature touches and what is unknown
     about it.
   - **Risks:** the top 3-5 risks, each with a one-line mitigation.
   - **Open questions:** what the spec author must settle, each with a
     recommended default.
4. **Break the story into tasks.** Each task `T-<n>`:
   - delivers one observable piece of the story,
   - is small enough to build and verify in a single focused session,
   - maps to at least one `AC-<n>` (or a sketch `R-<n>`),
   - names its dependencies on other tasks.
   Order tasks by dependency, not by perceived importance.
5. **Point each task and write the rationale.** Use the Fibonacci scale
   (1, 2, 3, 5, 8). The point is a relative size estimate, not a time
   estimate. For each task, write one line of rationale: what makes it that
   size (unknowns, integration surface, test surface, risk). A task with no
   rationale is a guess wearing a number.
   - **1:** one file, no unknowns, obvious test.
   - **2:** a few files, one small unknown.
   - **3:** multiple files or one real unknown; a full day of focused work.
   - **5:** significant unknowns or integration surface; would be split if it
     could be.
   - **8:** too big to estimate honestly. Split it, or flag it as a spike
     (a task whose output is knowledge, not code).
6. **Sanity-check the total.** If the story's points exceed the team's
   iteration capacity, say so and propose which tasks to cut or defer (cite
   the `NG-*` or AC they would drop). Do not silently shrink the story.
7. **Return both artifacts** in chat with their file paths, and stop. Do not
   write the spec, do not plan the build, do not implement.

## Writing rules

- **The sketch is a head start, not a shortcut.** It exists so the spec
  author starts from your hypotheses instead of a blank page. Every `assumed`
  requirement is a question the spec must answer, not an answer the spec
  inherits.
- **Tasks are vertical, not horizontal.** A task is "the retry endpoint works
  end to end", not "write the database layer". Horizontal tasks (all the
  models, then all the endpoints) produce code that cannot be tested until
  the last task.
- **Pointing rationale is mandatory.** The number without the reason is
  unreviewable. The rationale is what the team argues with in planning.
- **Spikes are named as spikes.** When a task's output is knowledge (a
  prototype, a benchmark, a proof of concept), say so. Spikes are not
  delivered as production code.
- **Dependencies are explicit.** "Depends on: T-2, T-5" or "None". A task
  with hidden dependencies is a scheduling bug waiting to happen.

## Templates

### Spec sketch (`.specs/<slug>/sketch.md`)

```markdown
# Spec Sketch: <feature name>

> **Slug:** <slug>
> **Story:** S-<n> — <title>
> **Status:** Head start for /spec (not a spec)
> **Date:** <YYYY-MM-DD>

## Proposed requirements

- **R-1 (confirmed):** <behavior stated in the story>
- **R-2 (assumed):** <your inference — spec author must verify>
- **R-3 (assumed):** <...>

## Proposed interfaces

<Interfaces you expect the spec to need, with rough shapes. Hypotheses, not
contracts.>

### <Interface 1>
- <rough request/response or signature>
- <what is unknown about it>

## Data questions

- <data the feature touches, and what is unknown about it>

## Risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | <risk> | <one-line mitigation> |
| 2 | <...> | <...> |

## Open questions for the spec author

- <question, with recommended default>
```

### Task breakdown (`.specs/<slug>/tasks.md`)

```markdown
# Tasks: <feature name>

> **Slug:** <slug>
> **Story:** S-<n> — <title>
> **Total points:** <sum>
> **Date:** <YYYY-MM-DD>

| ID | Task | Maps to | Points | Rationale | Depends on |
|---|---|---|---|---|---|
| T-1 | <one observable piece> | AC-1 | 2 | <what makes it this size> | None |
| T-2 | <...> | AC-2, R-2 | 3 | <...> | T-1 |
| T-3 | <spike: ...> | R-4 | 5 | <unknown being resolved> | None |

## Notes

- <anything a planner needs: cut candidates if over capacity, sequencing
  constraints, external dependencies>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll skip the sketch, the spec author can figure it out" | The sketch is the difference between a spec author starting from your hypotheses and starting from a blank page. Ten minutes of sketching saves an hour of re-reading the codebase. |
| "Points are just a number, the rationale is optional" | A number without a reason is unreviewable. The rationale is what the team argues with — "5 because the provider contract is unknown" is a decision; "5" is a mood. |
| "I'll point by how long it will take" | Points are relative size, not time. A 3-point task for a senior engineer is a 5 for a junior; the point should track the unknowns and the surface, not the clock. |
| "Horizontal tasks are faster to estimate" | "All the models, then all the endpoints" is easy to point and impossible to test until the end. Vertical tasks are harder to slice and testable from the first one. |
| "An 8 is fine, it's just a big task" | An 8 means "I cannot estimate this honestly". Split it, or make it a spike. Shipping an 8 into a sprint is how sprints miss. |
| "The story is big but I'll refine it anyway" | Refinement splits tasks within a story. If the story is two stories, the breakdown is a fiction — split the story first. |

## Red Flags

- A task that is a layer ("write the database layer"), not an outcome.
- A point with no rationale.
- A task with no `Maps to` — work that traces to no acceptance criterion.
- Hidden dependencies (a task that needs another task's output but says "None").
- The sketch presented as a spec (Status says "spec" or the interfaces are
  written as contracts).
- A story over iteration capacity with no cut proposal.
- Refinement proceeding over a Not-ready triage verdict.

## Verification

Before returning, confirm:

- [ ] `.specs/<slug>/sketch.md` exists and is marked as a head start, not a spec.
- [ ] Every sketch requirement is marked `confirmed` or `assumed`.
- [ ] The sketch has risks (3-5) and open questions with recommended defaults.
- [ ] `.specs/<slug>/tasks.md` exists with the task table.
- [ ] Every task maps to at least one `AC-<n>` or sketch `R-<n>`.
- [ ] Every task has points on the Fibonacci scale and a one-line rationale.
- [ ] Every task names its dependencies explicitly.
- [ ] Tasks are ordered by dependency and are vertical (each delivers an observable piece).
- [ ] The total points were checked against iteration capacity; over-capacity stories have a cut proposal.
- [ ] No spec, plan, or implementation was produced.

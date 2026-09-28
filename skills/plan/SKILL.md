---
name: plan
description: Plans how to build agreed requirements — from an approved spec or from the conversation — into ordered, verifiable build slices. Use when a multi-slice change needs an implementation plan. Use when tasks exist but their build order, parallelism, and verification checkpoints are undefined. Not for writing code or for single-slice changes.
---

# Plan

## Overview

Turn agreed requirements — an approved spec, or requirements confirmed in the
conversation — into a build plan: the components to create, the order
they must be built in, what can run in parallel, and the verification
checkpoint after each slice. The plan is the input to implementation — it decides
*in what order and how to check*, while implementation decides *how to write each
slice*.

## When to Use

- Requirements are agreed (an approved `.specs/<slug>/spec.md`, or a list the
  user confirmed in the conversation) and nothing has been planned.
- Tasks exist (`.specs/<slug>/tasks.md`) but their build order, parallelism,
  and checkpoints are undefined.
- A multi-slice feature is about to start and you need to know what "done
  with evidence" looks like at each step.

**When NOT to use:** The requirements and test criteria cannot be found
anywhere in the context (no story, no spec sketch, no documented behavior) —
a plan with nothing to plan from is a guess. The work is a single slice (no
plan needed — build it directly). You are planning a technical design that
has open decisions (settle them first). A missing spec is not a stop: plan
from the context (see Inputs). A spec file that exists but is still `Draft`
is a stop — get it approved first (Process step 1).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| Approved spec (`R-*`, `TC-*`, contracts) | `.specs/<slug>/spec.md` | Proceed from context, not as a stop. Pull the requirements and test criteria from the conversation — the request, the story's `AC-*`, the spec sketch's `R-*`, documented contracts, and the code itself — and mark each as context-sourced in the plan. Restate them and get the user's confirmation before planning (see Agreed expectations). If the requirements exist nowhere in the context, stop and say what is missing. |
| Task breakdown (`T-*`) | `.specs/<slug>/tasks.md` | Proceed. Derive slices from the requirements directly; tasks are a convenience, not an input this skill needs. |
| Quality bar (`C-*` gates) | `CONSTRAINTS.md` at repo root | Proceed. Set each slice's checkpoint from the repository's existing test and lint commands. |
| Repository structure | the codebase | Proceed, but a slice ordering built on a guessed structure is a guess. Verify where the code actually lives before fixing the order. |

**Where output goes.** Spec documents are optional. Write
`.specs/<slug>/plan.md` only when the project already keeps spec documents (a
`.specs/` directory, or its own spec tool's format — then use that format) or
the user asks for files. Otherwise return the plan in the conversation: the
IDs it assigns are still used, marked context-sourced, and carried into the
slice commits and the PR body.

**Agreed expectations.** Requirements count as agreed when a spec file says
`Status: Approved` with an approver, or — in context-driven work, with no spec
file — when the user has explicitly confirmed a restated list of the
requirements or acceptance criteria in the conversation. A spec file that is
still `Draft` is not agreed, and neither is a list the user never confirmed.

## Process

1. **Read the inputs.** Read the requirements `R-*`, test criteria `TC-*`,
   interfaces, data contracts, and rollback plan — from `.specs/<slug>/spec.md`
   when it exists, otherwise from the conversation — plus the tasks if they
   exist and the relevant existing code. If the requirements are not agreed
   (see Agreed expectations), stop: restate them and ask the user to confirm,
   or get the `Draft` spec approved.
2. **Identify the components.** List every component the requirements need:
   modules, endpoints, data migrations, jobs, UI surfaces, config. For each,
   note whether it is new or a modification of existing code, and which
   `R-*` it delivers.
3. **Order by dependency.** Build order follows data and interface
   dependencies, not file types:
   - Data contracts and migrations come before the code that reads them.
   - An interface's provider comes before its consumer.
   - A component that two others depend on comes before both.
   - If two components depend on each other, they are one component — say so
     and merge them.
4. **Mark parallelism.** Components with no dependency path between them can
   be built in parallel. Mark each component `parallel` (can start as soon as
   its dependencies are done) or `sequential` (must wait for a named
   component). Do not mark things parallel "to look efficient" — parallel
   slices that touch the same files are a merge-conflict factory.
5. **Define the slices.** Group components into build slices. A slice:
   - delivers at least one `R-*` end to end (code + its tests),
   - is verifiable on its own at its checkpoint,
   - is small enough to build in a single focused session.
   Number slices `SL-1`, `SL-2`, ... in build order. (Slice IDs `SL-<n>` are
   distinct from story IDs `S-<n>` in `story.md`.)
6. **Set a verification checkpoint for each slice.** Each checkpoint names
   the exact evidence that the slice is done: which `TC-*` must pass, which
   command runs them, and what a human checks if the tests cannot cover it.
   A checkpoint without a command is a wish.
7. **Note risks and rollback.** Carry the agreed rollback plan into the plan (if none
   was agreed, say so and propose one):
   which slice introduces risk (migrations, flag flips, public interfaces),
   and what the rollback looks like at that point. If a slice makes rollback
   harder than the previous one, say so explicitly.
8. **Write the plan** using the template below (see Where output goes).
9. **Present the result, then offer a spec only where specs are in use.** Show
   the full result — the plan, where it was saved (or that it lives in the
   conversation), the slice order, the checkpoints, the rollback position — in
   one place, and wait for the user's reaction. If nobody is there to respond
   (an automated or chained run), end here with the result reported and create
   nothing optional. Offer a spec file only if the project already keeps spec
   documents (`.specs/` or its own spec tool) or the user asked for one, and
   this work has none — and offer it at most once per session: a declined
   offer is not repeated, and the work stays context-driven. If the user
   agrees, write `.specs/<slug>/spec.md` from what this pass established — the
   requirements (`R-<n>`) the slices deliver, the test criteria (`TC-*`) the
   checkpoints run, and the decisions behind the order — with `Status: Draft`
   and the standard spec sections (context, scope, non-scope, interface and
   data contracts, behaviour, error and edge cases, test criteria,
   observability, rollback plan, open questions). Only a human approves it,
   later. Anything still open goes into its open questions, not invented. Do
   not build.

## Writing rules

- **The plan is reviewable in five minutes.** A reader should be able to say
  "yes, that order is right" or "no, the migration must come after the flag"
  without reading the code. If the plan needs the codebase to be
  understandable, it is too detailed — how to write the code is the
  implementer's job, not the plan's.
- **Every slice traces to requirements.** Each slice names the `R-*` it
  delivers and the `TC-*` its checkpoint runs. A slice that traces to nothing
  is scope creep with a checkpoint.
- **Checkpoints are cumulative.** Each checkpoint re-runs the previous
  slices' tests, not just the new ones. A green new slice on a red suite is
  not green.
- **Migrations get their own slice.** A data migration is its own slice with
   its own checkpoint (up, down, and the data check), never folded into a
   feature slice.
- **The plan names the first slice explicitly.** "Start with SL-1: ..." — the
  plan's last job is to tell the implementer exactly where to begin.

## Template

```markdown
# Plan: <feature name>

> **Slug:** <slug>
> **Requirements:** `.specs/<slug>/spec.md` (Status: Approved) | confirmed in
>   conversation on <YYYY-MM-DD>
> **Date:** <YYYY-MM-DD>

## Components

| Component | New/Modified | Delivers | Notes |
|---|---|---|---|
| <name> | new | R-1, R-2 | <one line> |
| <name> | modified | R-3 | <one line> |

## Build order

1. <component> — <why it is first>
2. <component> — <depends on 1 because ...>
3. <...>

## Slices

### SL-1: <name>
- **Components:** <which components this slice builds>
- **Delivers:** R-<n>, R-<n>
- **Parallel:** yes (with SL-<n>) | no (after SL-<n>)
- **Checkpoint:**
  - Tests: TC-U<n>, TC-I<n> — run with `<command>`
  - Manual: <what a human checks, or "none">
  - Regression: re-run <previous slices' test command>

### SL-2: <name>
- ...

## Risks and rollback

| Slice | Risk introduced | Rollback at this point |
|---|---|---|
| SL-<n> | <e.g. irreversible migration> | <what can still be rolled back> |

## Start

Start with **SL-1**: <one sentence on what the first slice builds and why it
is safe to start there>.
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll plan it out in my head while building" | The plan's value is the order and the checkpoints, decided before momentum takes over. "In my head" plans always start with the easiest file, not the dependency root. |
| "The tasks are already ordered, the plan is redundant" | Tasks are ordered by dependency for *estimation*. The plan adds what tasks do not have: parallelism, per-slice checkpoints, and the rollback position at each step. |
| "I'll make everything sequential to be safe" | Sequential is safe and slow. Two slices with no dependency path between them can run in parallel without risk — marking them sequential just to avoid thinking is how features take twice as long. |
| "The checkpoint can just be 'tests pass'" | "Tests pass" does not say which tests, with which command, or what a human checks when the tests cannot cover it. A checkpoint without a command is a wish. |
| "The migration can go in the feature slice" | A migration folded into a feature slice fails halfway and you cannot tell which half broke. Migrations are their own slice with their own up/down/data checkpoint. |
| "Rollback is the spec's section, not the plan's" | The spec says rollback is possible. The plan says what rollback looks like *at each slice* — and which slice makes it harder. That is a planning decision. |

## Red Flags

- A slice that delivers no `R-*`.
- A checkpoint with no command.
- A component that depends on two others that depend on each other (a cycle
  presented as an order).
- Parallel slices that touch the same files.
- A migration folded into a feature slice.
- The plan starts with the easiest component instead of the dependency root.
- Planning against requirements nobody agreed (a `Draft` spec, or an
  unconfirmed list).

## Verification

Before returning, confirm:

- [ ] The plan matches the template, saved or returned per Where output goes.
- [ ] The requirements are agreed (approved spec, or confirmed in conversation), and the plan cites where.
- [ ] Every component is marked new/modified and traces to `R-*`.
- [ ] Build order follows data and interface dependencies; no cycles.
- [ ] Every slice delivers at least one `R-*` and names its `TC-*` checkpoint with a command.
- [ ] Parallelism is marked only where there is no dependency path and no shared files.
- [ ] Migrations are their own slices with up/down/data checkpoints.
- [ ] The risk table names which slice introduces risk and the rollback position at each step.
- [ ] The plan ends with an explicit "Start with SL-1" instruction.
- [ ] No implementation has started.

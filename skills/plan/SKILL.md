---
name: plan
description: Plans how to build an approved spec into ordered, verifiable build slices. Use when a spec is approved and needs an implementation plan. Use when tasks exist but their build order, parallelism, and verification checkpoints are undefined.
---

# Plan

Turn an approved spec into a build plan: the components to create, the order
they must be built in, what can run in parallel, and the verification
checkpoint after each slice. The plan is the input to `build` — it decides
*in what order and how to check*, while `build` decides *how to write each
slice*.

## When to Use

- A spec (`.specs/<slug>/spec.md`) is approved and nothing has been planned.
- Tasks exist (`.specs/<slug>/tasks.md`) but their build order, parallelism,
  and checkpoints are undefined.
- A multi-slice feature is about to start and you need to know what "done
  with evidence" looks like at each step.

**When NOT to use:** The spec does not exist or is not approved (run `spec`
first — planning an unapproved spec is planning a draft). The work is a
single slice (no plan needed — `build` it directly). You are planning a
technical design that has open decisions (settle them in the spec first).

## Process

1. **Read the inputs.** Read `.specs/<slug>/spec.md` (requirements `R-*`,
   test criteria `TC-*`, interfaces, data contracts, rollback plan),
   `.specs/<slug>/tasks.md` if it exists, and the relevant existing code. If
   the spec's Status is not Approved, stop and say so.
2. **Identify the components.** List every component the spec requires:
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
7. **Note risks and rollback.** Carry the spec's rollback plan into the plan:
   which slice introduces risk (migrations, flag flips, public interfaces),
   and what the rollback looks like at that point. If a slice makes rollback
   harder than the previous one, say so explicitly.
8. **Write the plan** to `.specs/<slug>/plan.md` using the template below.
9. **Return the plan** in chat with the file path, and stop. Do not build.

## Writing rules

- **The plan is reviewable in five minutes.** A reader should be able to say
  "yes, that order is right" or "no, the migration must come after the flag"
  without reading the code. If the plan needs the codebase to be
  understandable, it is too detailed — that is `build`'s job.
- **Every slice traces to requirements.** Each slice names the `R-*` it
  delivers and the `TC-*` its checkpoint runs. A slice that traces to nothing
  is scope creep with a checkpoint.
- **Checkpoints are cumulative.** Each checkpoint re-runs the previous
  slices' tests, not just the new ones. A green new slice on a red suite is
  not green.
- **Migrations get their own slice.** A data migration is its own slice with
   its own checkpoint (up, down, and the data check), never folded into a
   feature slice.
- **The plan names the first slice explicitly.** "Start with S-1: ..." — the
  plan's last job is to tell `build` exactly where to begin.

## Template

```markdown
# Plan: <feature name>

> **Slug:** <slug>
> **Spec:** `.specs/<slug>/spec.md` (Status: Approved)
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
- Planning an unapproved spec.

## Verification

Before returning, confirm:

- [ ] `.specs/<slug>/plan.md` exists and matches the template.
- [ ] The spec's Status is Approved; the plan cites it.
- [ ] Every component is marked new/modified and traces to `R-*`.
- [ ] Build order follows data and interface dependencies; no cycles.
- [ ] Every slice delivers at least one `R-*` and names its `TC-*` checkpoint with a command.
- [ ] Parallelism is marked only where there is no dependency path and no shared files.
- [ ] Migrations are their own slices with up/down/data checkpoints.
- [ ] The risk table names which slice introduces risk and the rollback position at each step.
- [ ] The plan ends with an explicit "Start with SL-1" instruction.
- [ ] No implementation has started.

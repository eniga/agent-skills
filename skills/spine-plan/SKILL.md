---
name: spine-plan
description: Turns agreed requirements into ordered build slices with files, checkpoints, and rollback positions. Use when a multi-slice change needs an implementation plan, or build order and checkpoints are undefined. Not for writing code or single-slice changes.
---

# Spine Plan

## Overview

Decide the build order and how each step is checked. **Every slice delivers
a requirement end to end and has a checkpoint command.** The plan says what
order and how to verify; it does not say how to write the code.

## When to Use

- Requirements are agreed and nothing is planned.
- Tasks exist but order, parallelism, and checkpoints do not.

**Not for:** a single slice (build it); requirements that are not agreed (get
them confirmed first); a design with open decisions (settle those first).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Agreed requirements `R-*`, `TC-*`, contracts | `.specs/<slug>/spec.md`, or the conversation | Gather them from the request, story, sketch, and code. Restate them and get them confirmed. Stop if none exist anywhere, or if a spec file is still Draft. |
| Tasks `T-*` | `.specs/<slug>/tasks.md` | Proceed. Derive slices from the requirements. |
| Quality bar `C-*` | `CONSTRAINTS.md` | Proceed. Use the repository's test, lint, and scan commands. |
| Repository structure | the codebase | Proceed, but read where the code lives before fixing the order. |

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

1. **Read** the requirements, test criteria, contracts, rollback plan, tasks,
   and the code the change touches. Confirm the requirements are agreed.
2. **Map the impact.** For each requirement, find the existing files,
   interfaces, and helpers it lands in. List what is reused, what is
   modified, and what must be new. Prefer modifying over adding. Flag every
   change to a contract other code depends on.
3. **Order by dependency:**
   - data contracts and migrations before the code that reads them;
   - an interface's provider before its consumers;
   - shared pieces before the things that share them;
   - two components that need each other are one component.
4. **Cut slices.** Each `SL-<n>` delivers at least one `R-<n>` end to end
   (code and its tests), is verifiable alone, and fits one focused session.
   A migration is its own slice.
5. **Mark parallelism.** Two slices are parallel only when no dependency
   links them and they touch no file in common.
6. **Set each checkpoint:** the `TC-*` that must pass, the exact command,
   the earlier slices' tests to re-run, the quality and security gates that
   apply, and any manual check.
7. **Place risk and rollback.** For each risky slice (migration, flag flip,
   public interface, auth, or permission change), state what can still be
   rolled back at that point. Say when a slice makes rollback harder.
8. **Write the plan** using Output and name the first slice.
9. **Report.** Do not build.

## Rules

- A slice that delivers no `R-<n>` is scope creep. Remove it.
- A checkpoint without a command is not a checkpoint.
- Checkpoints are cumulative. A green slice on a red suite is red.
- Start at the dependency root, not at the easiest file.
- The plan is reviewable in five minutes without opening the code.
- Never plan against a Draft spec or an unconfirmed list.

## Output

Save to `.specs/<slug>/plan.md`, or return it in the conversation (contract
rule 8).

```markdown
# Plan: <feature>

> **Slug:** <slug> | **Date:** <YYYY-MM-DD>
> **Requirements:** `.specs/<slug>/spec.md` (Approved) | confirmed in conversation <date>

## Impact
| Requirement | Lands in | Reused | Modified | New | Contract change? |
|---|---|---|---|---|---|
| R-1 | `<path>` | <helper> | `<path>` | none | no |

## Slices

### SL-1: <name>
- **Delivers:** R-<n>
- **Touches:** `<paths>`
- **After:** none | SL-<n> | **Parallel with:** SL-<n> or none
- **Checkpoint:**
  - Tests: TC-U<n>, TC-I<n> with `<command>`
  - Regression: `<command>`
  - Gates: `<lint, type, scan commands>`
  - Manual: <check, or "none">

## Risk and rollback
| Slice | Risk introduced | Rollback at this point |
|---|---|---|
| SL-<n> | <for example an irreversible migration> | <what can still be undone> |

## Start
Start with **SL-1**: <what it builds and why it is safe to begin there>.
```

## Verification

- [ ] The requirements are agreed and the plan says where.
- [ ] The impact table names the files and whether each is reused,
      modified, or new.
- [ ] Every slice delivers an `R-<n>` and has a checkpoint command.
- [ ] The order follows dependencies, with no cycles.
- [ ] Parallel slices share no dependency and no file.
- [ ] Migrations are separate slices with up, down, and data checks.
- [ ] The risk table gives the rollback position per risky slice.
- [ ] The plan names the first slice. No code was written.

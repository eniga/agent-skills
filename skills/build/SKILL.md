---
name: build
description: Implements an approved spec incrementally, one vertical slice at a time, with tests generated from the spec's test criteria before the code that satisfies them. Use when a plan exists and implementation should start. Use when a slice is ready to build and its tests do not exist yet.
---

# Build

## Overview

Implement the plan, one slice at a time. Each slice is a thin vertical cut
through the system: code plus the tests that prove it, verified and committed
before the next slice starts. Every change is **minimal and task-targeted**:
the diff does exactly what the slice's requirements ask for and nothing
else.

The defining rule of this skill: **tests are generated from the spec's test
criteria section, not from finished code.** If you write the code first and
the tests after, the tests assert whatever the code does — including the
bugs. The spec's `TC-*` section is the fixed expectation; the code must meet
it, not the other way around.

## When to Use

- A plan (`.specs/<slug>/plan.md`) exists and implementation should start.
- A slice is ready to build and its tests do not exist yet.
- You are resuming an interrupted build and need to pick up at the next
  slice.

**When NOT to use:** There is no approved spec and no written expectations
anywhere in the context (see Inputs — this skill proceeds from context when
it exists, but not from nothing). The
change is a one-line fix with an obvious test (just do it — the slice
machinery is overhead for that). A test is failing for a reason you do not
yet understand (diagnose it first: reproduce, localize, and name the cause,
then resume the slice — guessing at a fix mid-slice is how symptoms get
patched and causes survive).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| Approved spec (requirements `R-*`, test criteria `TC-*`, contracts) | `.specs/<slug>/spec.md` | Proceed with fixed expectations pulled from the available context — the story's `AC-*`, the spec sketch's `R-*`, documented contracts — labelled `TC-*` and marked context-derived in the slice record. The defining rule still applies: tests are written from written expectations, not from finished code. If no expectations exist anywhere in the context, stop — writing tests from the code you are about to write is exactly what the rule forbids. If no spec file exists, propose creating one at the end of the process. |
| Build plan (slices `SL-*`, order, checkpoints) | `.specs/<slug>/plan.md` | If the work is genuinely one slice, proceed and treat the whole change as `SL-1`. Otherwise stop and get the slice order decided — building without an order is how half-finished vertical cuts pile up. |
| Quality bar (`C-*` rules and their gates) | `CONSTRAINTS.md` at repo root | Proceed. Apply the repository's existing lint, type, and test configuration as the bar, and say in the slice record that no written bar existed. |
| Task breakdown (`T-*`) | `.specs/<slug>/tasks.md` | Proceed. Tasks are useful for tracking but the slices in the plan are what this skill builds. |

This skill needs these artifacts, not the tools that produced them. Any spec
carrying numbered requirements and test criteria works.

## Process

1. **Read the inputs.** Read `.specs/<slug>/spec.md` (requirements, test
   criteria, contracts), `.specs/<slug>/plan.md` (slices, order,
   checkpoints), and `CONSTRAINTS.md` if it exists. If resuming, read the
   git log to find the last completed slice and start at the next one.
2. **Pick the next slice.** Take the first slice in the plan that is not yet
   complete. Confirm its dependencies are done (their checkpoints passed and
   committed). If a dependency is missing, stop and say which.
3. **Write the tests first, from the spec.** For every `TC-*` in the slice's
   checkpoint, write the test now — before any implementation code. The test
   is a direct translation of the `TC-*` entry: its setup, call, and
   assertion come from the spec's wording, not from your implementation
   ideas. If a `TC-*` is ambiguous enough that you cannot write the test
   without guessing, stop and raise it as a spec question — do not guess and
   record the guess in the test.
   - The tests must **fail** before the implementation exists (or fail for
     the right reason: missing function, wrong behavior). A test that passes
     before the code exists is not testing the new behavior.
4. **Implement the slice.** Write the smallest code that makes the slice's
   tests pass. Follow the spec's interface and data contracts exactly. Keep
   the change minimal and targeted at the slice: every changed line must
   trace to one of the slice's `R-*` requirements or to plumbing the
   requirement needs (imports, wiring, test scaffolding) — see Writing
   rules. If the implementation reveals the spec is wrong or incomplete,
   **stop and update the spec first** (it is a living document), then
   continue. Never silently diverge from the spec.
5. **Verify the slice at its checkpoint.**
   - Run the slice's new tests: all must pass.
   - Run the regression set: the previous slices' tests must still pass. A
     green new slice on a red suite is not green.
   - Run the `CONSTRAINTS.md` gates that apply at this stage (format, lint,
     type check, unit tests) if the file exists.
   - Do the manual check the checkpoint names, if any.
6. **Commit the slice.** One commit per slice, message shaped like
   `feat(<slug>): <slice name> (SL-<n>, R-<n>)`. The commit message carries
   the traceability: which slice, which requirements. Then append the slice
   record (see Templates) to `.specs/<slug>/plan.md`.
7. **Repeat** from step 2 until every slice in the plan is complete.
8. **Hand off for verification.** When the last slice is committed, stop.
   The full verification pass — focused tests, then the whole suite, then a
   per-`TC-*` pass/fail/unverified report — is a separate activity with its
   own evidence. Do not declare the feature done from inside this skill: a
   green checkpoint proves a slice, not a release.
9. **Present the result, then propose the spec.** Show the full result —
   the slices committed, the checkpoints passed, any spec deviations, the
   hand-off state — in one place, and wait for the user's reaction. Then, if
   no spec file exists for this work (`.specs/<slug>/spec.md`), ask whether
   to create one that captures what this pass established: the scope, the
   requirements (`R-<n>`) the slices delivered, the test criteria (`TC-*`)
   the checkpoints proved, and the decisions made along the way. Write it
   only if the user agrees, and only from what was actually established —
   anything still open goes into its open-questions section, not invented.
   If a spec file already exists, there is nothing to propose — it is the
   record, and a second spec for the same slug would be a second source of
   truth.

## Writing rules

- **One slice, one commit, one checkpoint.** No batching slices into one
  commit — a failed checkpoint then cannot say which slice broke.
- **Tests translate the spec, word for word where possible.** The `TC-*`
  entry says "when the provider times out, the order is marked
  `payment_pending`" — the test sets up a timeout, calls the handler, and
  asserts `payment_pending`. If the test says something the `TC-*` does not
  say, the test is testing your imagination.
- **No test-weakening to get green.** Never loosen an assertion, skip a
  test, or mock the thing under test to make a failing test pass. If the
  code cannot meet the spec, the code is wrong (or the spec is — see step
  4). Weakening the test is how bugs get certified.
- **The diff is targeted at the task.** Every hunk in the slice's commit
  must trace to an `R-*` the slice delivers, or to required plumbing.
  Minimal changes, as far as the task allows: no drive-by refactors,
  renames, or reformatting of adjacent code; no abstractions, helpers,
  configuration, or dependencies the spec does not ask for. A small diff is
  easier to review, easier to revert, and hides fewer unintended behavior
  changes. A problem noticed in adjacent code is recorded in the slice
  record as a follow-up — it is not fixed in this change.
- **Feature flags and safe defaults.** When a slice changes behavior that
  is live, put it behind the spec's flag or default it to the old behavior.
  The rollback plan in the spec exists for a reason.
- **Stop on a red checkpoint.** A failing checkpoint stops the build. Fix
  the failure (code or spec, in that order of suspicion), re-run, and only
  then continue. Continuing over a red checkpoint compounds the debt.

## Templates

The artifact `build` produces is the slice itself: a commit whose message
carries the traceability, plus a short slice record appended to the plan so a
resumed build knows where it stopped.

Commit message:

```
feat(<slug>): <slice name> (SL-<n>, R-<n>[, R-<m>])

<What this slice makes work, in one or two lines.>

Tests: <TC-* covered by this slice>
Checkpoint: <command> — <result>
```

Slice record (appended under the slice in `.specs/<slug>/plan.md`):

```markdown
- [x] **SL-<n> — <slice name>** — `<commit sha>`
      Requirements: R-<n>, R-<m>
      Tests written from: TC-U1, TC-I2
      Checkpoint: `<command>` — <pass / fail detail>
      Spec deviations: <none / R-<n> amended: reason>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write the tests after the code, it's faster" | Faster to write, useless to trust. Tests written after the code assert what the code does, bugs included. The spec's `TC-*` is the only fixed expectation you have — use it while it is still a requirement, not a description. |
| "The test passes before the code, so it must be fine" | A test that passes before the implementation exists is not exercising the new behavior. It is testing the absence of a crash. Make it fail first, for the right reason. |
| "I'll loosen this assertion, it's too strict" | The assertion came from the spec. Loosening it means the code no longer meets the spec — which is a spec question or a code bug, never a test edit. Weakened tests are how bugs get certified. |
| "I'll batch two slices into one commit to save time" | One checkpoint per slice is what tells you which slice broke when the suite goes red. Batching trades a minute of discipline for an hour of bisecting. |
| "While I'm here I'll also clean up this adjacent function" | The drive-by cleanup is a second change wearing the first change's commit. It buries the slice's behavior in unrelated lines, makes the review about the cleanup, and when it regresses something the bisect blames the whole commit. Note it as a follow-up; the cleanup becomes its own task with its own tests. |
| "The spec is wrong, I'll just build what makes sense" | "What makes sense" is your second guess at the requirement. Update the spec first — it is a living document and the change takes two minutes — then build from the updated spec. Silent divergence is how the PR review finds out the spec lied. |
| "The suite is red but my slice is green, I'll continue" | Your slice is green in a vacuum. The feature is what ships, and the feature is red. Stop, fix, continue. |
| "I'll skip the manual check, the tests cover it" | The checkpoint names the manual check because the tests cannot cover it — a browser flow, a permission state, a timing. Skipping it means the slice is verified by everything except the thing that needed a human. |

## Red Flags

- Implementation code existing before the slice's tests.
- A test that passes before the implementation exists.
- An assertion that was loosened, a test that was skipped, or a mock around
  the thing under test — to get green.
- A commit that contains more than one slice.
- A diff hunk that traces to nothing the slice requires: refactoring,
  renaming, reformatting, or an unrequested helper, abstraction, or
  dependency.
- Code that diverges from the spec's contracts without a spec update.
- A red checkpoint that was continued past.
- A slice with no commit-message traceability (no `SL-<n>`, no `R-<n>`).

## Verification

For each slice, before moving on, confirm:

- [ ] The slice's `TC-*` tests were written before the implementation code.
- [ ] The tests failed before the implementation (for the right reason) and pass after.
- [ ] No assertion was weakened, skipped, or mocked around to get green.
- [ ] The implementation matches the spec's interface and data contracts.
- [ ] Every changed file and hunk traces to the slice's `R-*` (or required plumbing) — no drive-by changes, no unrequested additions.
- [ ] The slice's checkpoint passed: new tests, regression set, applicable `CONSTRAINTS.md` gates, and the manual check if named.
- [ ] The slice is committed alone, with `SL-<n>` and `R-<n>` in the message.
- [ ] The slice record is appended to `plan.md` with its commit sha, so an interrupted build can resume.

For the whole build, before handing off for verification, confirm:

- [ ] Every slice in the plan is complete and committed.
- [ ] The full regression suite passes.
- [ ] Any spec changes made during the build are committed with the code.
- [ ] The hand-off for full verification is explicit — the feature is not declared done here.

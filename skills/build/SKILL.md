---
name: build
description: Implements an approved spec incrementally, one vertical slice at a time, with tests generated from the spec's test criteria before the code that satisfies them. Use when a plan exists and implementation should start. Use when a slice is ready to build and its tests do not exist yet.
---

# Build

## Overview

Implement the plan, one slice at a time. Each slice is a thin vertical cut
through the system: code plus the tests that prove it, verified and committed
before the next slice starts.

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

**When NOT to use:** The spec is not approved or the plan does not exist
(run `spec` / `plan` first). The change is a one-line fix with an obvious
test (just do it — the slice machinery is overhead for that). You are
debugging a failure (stop, fix the failure, then resume the slice).

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
   tests pass. Follow the spec's interface and data contracts exactly. If
   the implementation reveals the spec is wrong or incomplete, **stop and
   update the spec first** (it is a living document), then continue. Never
   silently diverge from the spec.
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
8. **Hand off to `test`.** When the last slice is committed, the full
   verification pass (focused + full suite + per-`TC-*` report) is the
   `test` skill's job. Do not declare the feature done from inside `build`.

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
| "The spec is wrong, I'll just build what makes sense" | "What makes sense" is your second guess at the requirement. Update the spec first — it is a living document and the change takes two minutes — then build from the updated spec. Silent divergence is how the PR review finds out the spec lied. |
| "The suite is red but my slice is green, I'll continue" | Your slice is green in a vacuum. The feature is what ships, and the feature is red. Stop, fix, continue. |
| "I'll skip the manual check, the tests cover it" | The checkpoint names the manual check because the tests cannot cover it — a browser flow, a permission state, a timing. Skipping it means the slice is verified by everything except the thing that needed a human. |

## Red Flags

- Implementation code existing before the slice's tests.
- A test that passes before the implementation exists.
- An assertion that was loosened, a test that was skipped, or a mock around
  the thing under test — to get green.
- A commit that contains more than one slice.
- Code that diverges from the spec's contracts without a spec update.
- A red checkpoint that was continued past.
- A slice with no commit-message traceability (no `SL-<n>`, no `R-<n>`).

## Verification

For each slice, before moving on, confirm:

- [ ] The slice's `TC-*` tests were written before the implementation code.
- [ ] The tests failed before the implementation (for the right reason) and pass after.
- [ ] No assertion was weakened, skipped, or mocked around to get green.
- [ ] The implementation matches the spec's interface and data contracts.
- [ ] The slice's checkpoint passed: new tests, regression set, applicable `CONSTRAINTS.md` gates, and the manual check if named.
- [ ] The slice is committed alone, with `SL-<n>` and `R-<n>` in the message.
- [ ] The slice record is appended to `plan.md` with its commit sha, so an interrupted build can resume.

For the whole build, before handing off to `test`, confirm:

- [ ] Every slice in the plan is complete and committed.
- [ ] The full regression suite passes.
- [ ] Any spec changes made during the build are committed with the code.
- [ ] The hand-off to `test` is explicit — the feature is not declared done here.

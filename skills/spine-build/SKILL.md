---
name: spine-build
description: Implements agreed requirements one vertical slice at a time, with the smallest diff that works, tests written from the test criteria before the code, and one verified commit per slice. Use when a feature, fix, or change is ready to implement. Use when a slice is ready to build and its tests do not exist yet. Not for diagnosing an unexplained failure.
---

# Spine Build

## Overview

Build the plan one slice at a time: tests, then code, then a verified
commit. **Tests come from the written test criteria, not from finished code,
and every changed line traces to a requirement.** The best diff is the
smallest one that satisfies the slice without breaking any caller.

## When to Use

- Requirements are agreed and a slice order exists, or the change is one
  slice.
- You are resuming a build at the next slice.

**Not for:** work with no written expectations anywhere; a failing test whose
cause is unknown (find the cause first); a one-line fix with an obvious test
(just make it).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Agreed requirements `R-*`, `TC-*`, contracts | `.specs/<slug>/spec.md`, or the conversation | Restate the request as numbered `R-*` and `TC-*`, marked context-sourced, and get them confirmed before writing any test. Stop if no expectations exist anywhere. |
| Slice order `SL-*` and checkpoints | `.specs/<slug>/plan.md`, or the conversation | One slice: treat the change as `SL-1`. More: stop and get the order decided. |
| Quality bar `C-*` | `CONSTRAINTS.md` | Proceed with the repository's lint, type, test, and scan setup. |

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

1. **Read** the requirements, contracts, slice order, and `CONSTRAINTS.md`.
   Confirm the requirements are agreed. When resuming, find the last
   `SL-<n>` in `git log` and start at the next one.
2. **Pick the next slice.** Its dependencies must be committed with green
   checkpoints. If one is missing, stop and name it.
3. **Find the smallest change, before editing anything.**
   - Read the code path the slice touches, from entry to effect.
   - Search for an existing function, type, or pattern that already does
     part of the job. Reuse it.
   - List the files you expect to change, and every caller of anything
     whose signature or behavior will change.
   - If two approaches work, take the one that changes fewer lines and no
     existing contract.
   - Write this as a change plan of a few lines.
4. **Write the tests first.** Translate each `TC-*` in the slice directly:
   its setup, action, and expected result. Run them and watch them fail for
   the right reason. If a `TC-*` is too vague to test without guessing,
   stop and ask.
5. **Implement** the least code that makes those tests pass. Follow the
   agreed contracts exactly and the conventions of the surrounding code.
   Validate untrusted input at the boundary. If the diff grows past the
   change plan, stop and re-plan or ask.
6. **Run the checkpoint:**
   - the slice's new tests;
   - the earlier slices' tests and the regression command;
   - format, lint, type, and security gates that apply;
   - the manual check, if the checkpoint names one.
7. **Review your own diff.** Every hunk traces to an `R-*` of this slice or
   to plumbing it needs. Revert anything else. Remove debug output. Confirm
   no secret, credential, or personal data is in the code or the tests.
8. **Commit the slice alone.** When a plan file is kept, append the slice
   record first so it ships in the same commit.
9. **Repeat** from step 2 until every slice is done, then report. A green
   checkpoint proves a slice. Full verification is separate work.

## Rules

- Tests before code. A test that passes before the code exists tests
  nothing.
- Never weaken an assertion, skip a test, or mock the thing under test to
  get green. If the code cannot meet the requirement, the code or the
  requirement is wrong.
- If the requirements turn out wrong, stop. A draft is corrected. Agreed
  requirements change only by a recorded, re-approved amendment.
- One slice, one commit, one checkpoint. A red checkpoint stops the build.
- Changing existing behavior that is live goes behind the agreed flag, or
  defaults to the old behavior.
- A new dependency, helper, abstraction, or config option needs a
  requirement that asks for it.
- "This is obviously needed too" is a question for the user, not a commit.

## Output

Commit message:

```
<type>(<slug>): <slice name> (SL-<n>, R-<n>[, R-<m>])

<What this slice makes work, in one or two lines.>

Tests: <TC-* covered>
Checkpoint: <command> -> <result>
```

Slice record, appended to `.specs/<slug>/plan.md` when a plan file is kept.
Otherwise the commit message is the record.

```markdown
- [x] **SL-<n>: <slice name>**
      Requirements: R-<n>
      Tests written from: TC-U1, TC-I2
      Files changed: <paths> (planned: <paths>)
      Checkpoint: `<command>` -> <result>
      Deviations: none | <amendment, approved by <name>>
      Follow-ups (out of scope): none | <what, where>
```

## Verification

Per slice:

- [ ] A change plan listed the files and affected callers before editing.
- [ ] Tests were written from `TC-*` first, failed first, and pass now.
- [ ] No assertion was weakened, skipped, or mocked around.
- [ ] Existing callers work unchanged, or the contract change was approved.
- [ ] Every hunk traces to the slice's `R-*` or required plumbing.
- [ ] The checkpoint passed: new tests, regression, gates, manual check.
- [ ] No secret or debug output is in the diff.
- [ ] One commit, carrying `SL-<n>` and `R-<n>`.

Whole build:

- [ ] Every slice is committed and the full suite passes.
- [ ] Amendments are recorded and re-approved. Follow-ups are listed.
- [ ] The feature is handed off for verification, not declared done.

---
name: spine-test
description: Proves a change works and reports every test criterion as pass, fail, or unverified, with evidence. Use when a build is complete and needs proof before review or merge. Not for writing tests while implementing, or finding the cause of a failure.
---

# Spine Test

## Overview

Produce evidence that the change works. **Focused tests first, then the full
suite. Every criterion ends as pass, fail, or unverified, with a command and
its output.** This skill reports; it does not fix.

## When to Use

- A build or code change is complete and needs proof.
- A change is about to be reviewed or merged without test evidence.

**Not for:** writing tests during implementation; finding the cause of a
failure; a documentation-only change (say there is nothing to run).

## Inputs

| Input | Where | If missing |
|---|---|---|
| The change | diff, branch, commit range | Stop. Ask which change is being verified. |
| Test criteria `TC-*` | `.specs/<slug>/spec.md`, or the conversation | Derive them from the acceptance criteria or from the behaviors the diff adds. Label them yourself and report them as derived. |
| Quality bar `C-*` | `CONSTRAINTS.md` | Proceed. Report numbers without judging them against a threshold. |
| Slice records `SL-*` | `.specs/<slug>/plan.md` | Proceed. Scope the focused run from the diff. |

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

1. **Read** the change, the test criteria, and how this repository runs its
   tests and gates.
2. **List every criterion** the change must satisfy and every existing
   behavior it touches. This list is the report's skeleton.
3. **Run the focused tests:** the narrowest tests for the changed behavior.
   Record the command and the result. If one fails, stop, report it, and do
   not run the full suite; the report's Regressions section reads "not run:
   stopped on a focused failure".
4. **Run the full suite** (unit and integration; end to end when the change
   touches a user-facing flow). A failure the focused run did not show is a
   regression: name the test and the likely interaction. To call a failure
   pre-existing, show it failing on the base branch.
5. **Run the gates that apply:** lint, type check, coverage, secret scan,
   dependency audit, code scanning. Record each command and its result.
6. **Cover what tests cannot.** For a criterion no automated test exercises,
   perform the check and record the evidence, or mark it Unverified and say
   what would verify it.
7. **Write the report** using Output, failures and unverified items first.
8. **Report.**

## Rules

- Evidence is a command and its output. "Tests pass" is a claim.
- Three results only: Pass, Fail, Unverified. Reading the code is not a
  Pass.
- Fix nothing here. A fix changes what was tested and voids the report.
- Never edit an earlier run's results. A new run is a new record.
- A skipped suite or gate is recorded with its reason.
- A small diff gets the same full suite.
- Never paste secrets or personal data into the report. Redact them.

## Output

Save to `.specs/<slug>/evidence/test-<YYYY-MM-DD>.md`, or return it in the
conversation (contract rule 8).

```markdown
# Test report: <change>

> **Date:** <YYYY-MM-DD>
> **Change:** <branch / PR / range> at `<head sha>`
> **Criteria from:** spec | agreed in conversation | derived from <source>

## Summary
- **Focused:** pass | fail: <n> tests, `<command>`
- **Full suite:** pass | fail | not run (<reason>): <n> tests, `<command>`
- **Gates:** <each gate: pass | fail | not run>
- **Verdict:** Proven | Partially proven | Not proven

## Failures and unverified
| # | Criterion | Result | Evidence | What would close it |
|---|---|---|---|---|
| 1 | TC-I2 (R-4) | Fail | `<command>`: <failure detail> | <what is needed> |
| 2 | TC-E1 (R-1) | Unverified | no automated test | <manual flow> |

## Per-criterion results
| Criterion | Result | Evidence |
|---|---|---|
| TC-U1 (R-1) | Pass | `<command>`: 12 passed |

## Gates
| Gate | Command | Result |
|---|---|---|
| C-3 secret scan | `<command>` | pass |

## Regressions
- <existing test now failing and the likely cause, "none", or "not run: stopped on a focused failure">

## Notes
<Flaky tests seen, suites skipped and why, environment.>
```

Verdict: **Proven** when every criterion passes and the full suite and
blocking gates are green. **Partially proven** when nothing fails but
something is unverified or not run. **Not proven** when anything fails.

## Verification

- [ ] Focused tests ran first, with command and result recorded.
- [ ] The full suite ran, or the report stops at the focused failure, or the
      skip has a reason.
- [ ] Every criterion has a row: Pass, Fail, or Unverified.
- [ ] Every Pass has a command and output. Every Unverified says what would
      close it.
- [ ] Gates that apply were run and recorded.
- [ ] Regressions are named with a likely cause.
- [ ] The report leads with failures, names the head commit, and nothing was
      fixed.

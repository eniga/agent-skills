---
name: spine-test
description: Proves a change works by running the focused tests first, then the full suite and the quality and security gates, and reporting every test criterion as pass, fail, or unverified with the command and output. Use when a build is complete and needs proof. Use when a change needs verification before review or merge. Not for writing tests while implementing or finding the cause of a failure.
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

1. **Read** the change, the test criteria, and how this repository runs its
   tests and gates.
2. **List every criterion** the change must satisfy and every existing
   behavior it touches. This list is the report's skeleton.
3. **Run the focused tests:** the narrowest tests for the changed behavior.
   Record the command and the result. If one fails, stop, report it, and do
   not run the full suite.
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
- <existing test now failing and the likely cause, or "none">

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

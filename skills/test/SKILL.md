---
name: test
description: Proves a change works by running the focused tests for the new change first, then the full suite to catch regressions, and reporting each test criterion as pass, fail, or unverified with evidence. Use when a build is complete and needs proof. Use when a change needs verification before review or merge.
---

# Test

Prove that it works. Testing is evidence production: every claim that the
change works must be backed by a command that was run and an output that was
seen. "Seems right" and "the code looks correct" are not evidence.

The order matters: **run the focused tests for the new change first, then the
full suite.** Focused-first finds the change's own bugs fast; the full suite
then proves the change broke nothing else. Running only the full suite hides
which failures are new; running only the focused suite proves nothing about
regressions.

## When to Use

- A build (or any code change) is complete and needs proof before review.
- A change is about to go to `review` or `pr-prepare` and has no test
  evidence yet.
- You need to know whether a change broke anything, with per-criterion
  results.

**When NOT to use:** You are writing the tests as part of the build (that is
`build` — tests are written from the spec's `TC-*` before the code). The
change is a documentation-only edit (no tests to run; say so). You are
debugging a specific failure (reproduce and localize first; this skill
reports, it does not fix).

## Process

1. **Read the inputs.** Read the change (diff or branch), the spec's test
   criteria (`.specs/<slug>/spec.md`, section 8) if one exists, and the
   repository's test setup (how tests are run, what the suites are). If
   there is no spec, the acceptance criteria come from the story or the task
   — use whatever fixed expectation exists, and say which.
2. **Map the change to criteria.** List every `TC-*` (or acceptance
   criterion) the change is supposed to satisfy, and every area of existing
   behavior the change touches. This list is the report's skeleton — every
   row must end with a result.
3. **Run the focused tests first.** Run the narrowest tests that exercise the
   changed behavior — the tests for the changed modules, the `TC-*` the
   change implements. Record the command and the result.
   - If a focused test fails, **stop here.** Do not run the full suite yet —
     report the failure, what it suggests, and stop. A full-suite run on top
     of a known failure just adds noise.
4. **Run the full suite.** With the focused tests green, run the entire test
   suite (unit + integration; e2e if the change touches user-facing flows and
   the suite includes them). Record the command and the result.
   - A full-suite failure that the focused run did not show is a
     **regression** caused by the change. Report it as such, with the failing
     test and the likely interaction.
5. **Cover what tests cannot.** For criteria that no automated test
   exercises (a browser flow, a permission state, a timing, a manual
   checkpoint from the plan), either perform the check and record the
   evidence, or mark the criterion **unverified** and say exactly what would
   verify it. Never mark a criterion pass because the code "looks like it
   does that".
6. **Write the report** using the template below. Save it to
   `.specs/<slug>/evidence/test-<date>.md` if a slug exists, otherwise return
   it in chat. Every criterion row has a result and evidence.
7. **Return the report** in chat, leading with failures and unverified
   criteria — never bury them below the passes. Stop. Do not fix failures;
   report them. Fixing is `build`'s job (or a new task).

## Writing rules

- **Evidence is a command and an output.** "Ran `npm test -- payment`, 42
  passed" is evidence. "Tests pass" is a claim. Include the command, the
  count, and the failure detail for anything that failed.
- **Results are three-valued.** Pass, fail, or unverified. There is no
  "probably passes". A criterion you did not check is unverified, full stop.
- **Failures lead.** The report opens with what is broken and what is
  unknown, then what works. A report that leads with 40 passes and hides 1
  failure has failed at its job.
- **Regressions are named as regressions.** A pre-existing test that now
  fails because of the change is reported as "regression: <test>, likely
  caused by <change>", not just as a failure.
- **The report is append-only history.** Each test run gets its own file or
  section with a date. Do not edit a previous run's results — a new run is a
  new record.

## Template

```markdown
# Test Report: <change / feature>

> **Date:** <YYYY-MM-DD>
> **Change:** <branch / PR / commit range>
> **Spec:** `.specs/<slug>/spec.md` (or: no spec — criteria from <source>)

## Summary

- **Focused:** <pass/fail> — <n> tests, <command>
- **Full suite:** <pass/fail> — <n> tests, <command>
- **Verdict:** Proven | Not proven | Partially proven

## Failures and unverified (lead with these)

| # | Criterion | Result | Evidence | What would close it |
|---|---|---|---|---|
| 1 | TC-I2 (R-4) | Fail | `<command>` — <failure detail> | <fix needed> |
| 2 | TC-E1 (R-1) | Unverified | no e2e test exists | <manual flow to run> |

## Per-criterion results

| Criterion | Result | Evidence |
|---|---|---|
| TC-U1 (R-1) | Pass | `<command>` — 12 passed |
| TC-U2 (R-4) | Pass | `<command>` — 12 passed |
| TC-I1 (R-2) | Pass | `<command>` — 5 passed |
| TC-E1 (R-1) | Unverified | <see above> |

## Regressions

- <pre-existing test now failing, likely cause — or "none">

## Notes

<Anything a reviewer needs: flaky tests observed, suites skipped and why,
environment details.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The full suite is slow, I'll just run the focused tests" | The focused suite proves the change works; the full suite proves it broke nothing. Skipping the full suite means the regression is found in production, where it is more expensive. If the full suite is too slow, that is a `CONSTRAINTS.md` conversation, not a silent skip. |
| "The tests passed last time, the change is small" | "Small" is exactly when the untested interaction hides. The suite does not get a discount for small diffs. |
| "I'll mark it pass, the code clearly does that" | Reading code is not running it. The report is evidence, and the only evidence that a behavior happens is a test or a check that observed it happen. |
| "The failure is pre-existing, so it doesn't count" | A pre-existing failure that your change made visible is still on your report. Say it is pre-existing (with evidence: it fails on the base branch too) — but do not delete it from the record. |
| "I'll fix the failure while I'm here" | Testing reports; it does not fix. A fix changes the change, which invalidates the report you are writing. Report, then let `build` (or a task) fix, then re-test. |
| "One more test run after the fix can share this report" | Each run is a record. Editing the old results to match the new run destroys the history that says what was true when. New run, new file. |

## Red Flags

- A report with no commands — only adjectives ("green", "looks good").
- A criterion marked Pass with no evidence.
- Failures listed after the passes, or described as "minor".
- A full-suite skip with no recorded reason.
- A regression reported as an ordinary failure with no likely cause.
- Previous run results edited instead of a new run recorded.
- "Probably passes" or "should be fine" anywhere in the report.

## Verification

Before returning, confirm:

- [ ] Focused tests ran first; their command and result are recorded.
- [ ] If focused tests failed, the full suite was not run and the report stops at the failure.
- [ ] The full suite ran (or the skip is recorded with a reason); its command and result are recorded.
- [ ] Every criterion in the change's scope has a row: Pass, Fail, or Unverified.
- [ ] Every Pass has command-and-output evidence; every Unverified says what would close it.
- [ ] Regressions are named as regressions with a likely cause.
- [ ] The report leads with failures and unverified criteria.
- [ ] The report was saved (`.specs/<slug>/evidence/`) or returned in chat, and no fixes were made.

---
name: spine-diagnose
description: Finds and proves the cause of a defect with a reproduction and a failing regression test, before any fix. Use when something is broken, wrong, failing, flaky, or behaving unexpectedly and the cause is not yet proven, including user reports and requests to look into or investigate a problem. Use before editing code to fix a bug.
---

# Spine Diagnose

## Overview

Find the cause of a defect and prove it. **No fix before a reproduction and
a named cause.** A change that hides the symptom without explaining it has
moved the failure, not removed it. The deliverable is a defect record and a
failing regression test.

## When to Use

- A test fails and you do not know why.
- It works in one environment and not in another.
- A bug report shows behavior that differs from what is expected.
- Behavior is intermittent or flaky.

**Not for:** a cause already proven (write the fix and its test); a missing
feature (that is new work); verifying a finished change.

## Inputs

| Input | Where | If missing |
|---|---|---|
| Symptom | error, failing test, report, log | Stop. Ask what was seen, what was expected, and where. |
| A way to run the system | test command, dev server, staging | Proceed from logs, traces, and code alone, and say so. The status can be at most `cause unproven`: without a run there is no proof and no regression test. |
| Expected behavior `R-*`, `AC-*`, `TC-*` | spec, story, contract, docs | Proceed. Use the documented or reasonable expectation and say which. Record that no criterion covered it. |
| Recent changes | `git log`, deploy history | Proceed. |

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

1. **State the gap:** what is expected (quote the source) and what actually
   happens (the exact error or value). Without both halves there is no
   defect yet.
2. **Reproduce it** with the smallest reliable command, test, or request.
   Record the exact invocation and output. If it does not reproduce, report
   what you tried and stop. If it is intermittent, record the rate: n
   failures in m runs.
3. **Capture it as a failing test** at the lowest level that shows it. Watch
   it fail with a message that describes the real gap. Unless the fix
   follows on the same branch, mark it expected-failure citing `D-<n>`, so it
   still runs: `xfail`, `test.fails`, or `node:test`'s `{ todo }` or
   `{ expectFailure }`. Never skip or disable it: a skipped test proves nothing.
4. **Localize it.** Use the cheapest of:
   - bisect the input: which argument or record triggers it;
   - bisect the path: the first point where a value is already wrong;
   - bisect history: the commit where it stopped working;
   - bisect the environment: what differs where it works.

   Stop when you can name the function, line, or interaction.
5. **Test one hypothesis at a time:** "the cause is X; if so, Y must be
   true". Check Y. Record each hypothesis and its result, including the
   ones you eliminated.
6. **Prove the cause.** It must explain the error, when it happens, when it
   does not, and the rate. Make the defect appear and disappear by changing
   the cause alone. Then revert every experiment.
7. **Classify it:**
   - **Code defect:** the code does not do what was specified.
   - **Specification defect:** the code does what was specified, and that is
     wrong or silent. The requirement changes first.
   - **Test defect:** the behavior is right and the test asserts the wrong
     thing.
8. **Check the blast radius:** search for other call sites, inputs, or flows
   with the same cause.
9. **Write the defect record** using Output, then report. The fix is separate
   work, verified against the failing test.

## Rules

- Change one thing between two runs. Never more.
- A guard at the crash site hides the wrong value produced upstream. Find
  where the value became wrong.
- Never edit a failing test to make it pass. Prove the test wrong first.
- Flaky means a race, shared state, a clock, or ordering. Record the rate
  and diagnose it. Re-running is not a fix.
- If time runs out, record `cause unproven` and call any patch a mitigation.
- Leave no experiment behind. The only change that remains is the
  regression test.
- A security defect is reported to the user first. Keep exploit detail,
  secrets, and personal data out of the record, the test, and the logs.

## Output

Save to `.specs/<slug>/defects/D-<n>.md`, or return it in the conversation
(contract rule 8).

```markdown
# D-<n>: <one-line symptom>

> **Date:** <YYYY-MM-DD>
> **Severity:** blocker | major | minor
> **Status:** cause proven | cause unproven | not reproducible
> **Violates:** R-<n> / AC-<n> / TC-<n> / contract / none covered it

## Gap
- **Expected:** <quoted>
- **Actual:** <exact behavior, error, or value>
- **Conditions:** <environment, input, timing>
- **Rate:** always | <n> in <m> runs

## Reproduction
    <exact command or steps>
    <exact output>

Failing test: `<path::test_name>`, fails with `<message>`.

## Hypotheses
| # | Hypothesis | Check | Result |
|---|---|---|---|
| 1 | <cause X> | <what must be true> | Eliminated: <what was seen> |
| 2 | <cause Y> | <what must be true> | Confirmed: <evidence> |

## Cause
<Which value becomes wrong, where (`path:line`), and why.>
- **Explains:** <symptom, conditions, non-occurrence, rate>
- **Demonstration:** <how it was made to appear and disappear>

## Classification
Code defect | Specification defect | Test defect, because <why>

## Fix direction
<What must change and where. Not the fix.>
**Regression guard:** `<path::test_name>` fails before the fix, passes after.

## Blast radius
<Other sites with the same cause, or "none found" with the search used.>
```

## Verification

- [ ] The gap states expected and actual, both concrete.
- [ ] The reproduction command and output are recorded, or non-reproduction
      is reported.
- [ ] A test fails because of this defect and was seen failing.
- [ ] Every hypothesis is recorded with its check and result.
- [ ] The cause names a location and explains symptom, conditions, and rate.
- [ ] The defect is classified and the blast radius was searched.
- [ ] No fix was applied, no test was weakened, and every experiment was
      reverted.

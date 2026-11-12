---
name: spine-diagnose
description: Finds and proves the cause of a defect by reproducing it, capturing it as a failing test, localizing it, and testing one hypothesis at a time, before any fix is written. Use when something is broken, failing, flaky, or behaving unexpectedly and the cause is unknown. Use when a bug needs a reproduction and a regression test before it is fixed.
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
| A way to run the system | test command, dev server, staging | Stop. A defect you cannot run cannot be reproduced. |
| Expected behavior `R-*`, `AC-*`, `TC-*` | spec, story, contract, docs | Proceed. Use the documented or reasonable expectation and say which. Record that no criterion covered it. |
| Recent changes | `git log`, deploy history | Proceed. |

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

1. **State the gap:** what is expected (quote the source) and what actually
   happens (the exact error or value). Without both halves there is no
   defect yet.
2. **Reproduce it** with the smallest reliable command, test, or request.
   Record the exact invocation and output. If it does not reproduce, report
   what you tried and stop. If it is intermittent, record the rate: n
   failures in m runs.
3. **Capture it as a failing test** at the lowest level that shows it. Watch
   it fail with a message that describes the real gap. Unless the fix
   follows on the same branch, mark it expected-failure (`xfail`,
   `test.fails`, `@Disabled` with a reason) citing `D-<n>`.
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

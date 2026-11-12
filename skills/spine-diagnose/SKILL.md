---
name: diagnose
description: Finds the cause of a defect by reproducing it, localizing it, and proving the cause before any fix is written, then records the defect against the behavior it violates. Use when something is broken, failing, flaky, or behaving unexpectedly and the cause is not yet known. Use when a test fails and you do not yet know why. Use when a bug needs a reproduction and a regression test before it is fixed.
---

# Diagnose

## Overview

Find the cause of a defect and prove it, before writing a fix. A defect is a
measurable gap between the behavior that was specified and the behavior that
happens: this skill reproduces that gap, localizes it to a cause, proves the
cause explains everything observed, and hands over a defect record with a
failing regression test.

The defining rule: **no fix before a reproduction and a named cause.** A
change that makes the symptom disappear without an explanation has not fixed
anything — it has moved the failure somewhere you are not looking.

## When to Use

- A test fails and you do not know why.
- Something works in one environment and not another.
- A bug report arrives with observed behavior that differs from expected.
- Behavior is intermittent, flaky, or non-deterministic.
- A change broke something and the connection is not obvious.

**When NOT to use:** The cause is already known and proven, and only the fix
remains (write the fix and its regression test). The behavior is not a
defect but a missing feature (that is new work — specify it). The code is
merely unclear but correct (that is a readability problem, not a defect). You
are verifying a finished change (that is a verification pass producing a
per-criterion report; this skill finds causes).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The symptom | an error, failing test, bug report, log, or screenshot | Stop. Ask what was observed, what was expected, and where. "It's broken" is not a symptom. |
| A way to run the system | test command, dev server, CLI, or staging access | Stop. A defect you cannot run is a defect you cannot reproduce, and everything downstream is a guess. |
| Specified behavior (`R-*`, `AC-*`, `TC-*`) | `.specs/<slug>/spec.md` or `story.md` | Proceed. Use the documented behavior, the contract, or the reasonable expectation instead, and say in the record which you used. Note that the absence of a criterion covering this behavior is itself a finding. |
| Recent changes | `git log`, `git bisect`, deploy history | Proceed. History narrows the search; it is not required to run it. |

**Where output goes.** Spec documents are optional. Write
`.specs/<slug>/defects/D-<n>.md` only when the project already keeps spec
documents (a `.specs/` directory, or its own spec tool's format — then use
that format) or the user asks for files. Otherwise return the defect record in
the conversation: the IDs it assigns are still used, marked context-sourced,
and carried into the fix's commit message and the PR body.

## Process

1. **State the gap.** Write down two things before touching any code: what
   is expected (quote the `R-*`, `AC-*`, `TC-*`, contract, or documented
   behavior) and what actually happens (the exact error, wrong value, or
   observed behavior). If you cannot state both halves, you do not yet have
   a defect — you have a feeling.
2. **Reproduce it.** Find the smallest reliable way to make it happen: a
   command, a test, a request, a sequence of steps. Record the exact
   invocation and its output.
   - **If it does not reproduce**, say so and stop. Report what you tried.
     Do not fix a defect you could not observe.
   - **If it is intermittent**, establish a rate (how many runs in how many
     attempts). A defect that happens 1 time in 20 needs that number
     recorded, because "it stopped happening" is not evidence of a fix.
3. **Capture the reproduction as a failing test.** Write the test that fails
   because of this defect, at the smallest level that still shows it. Watch
   it fail, and confirm the failure message describes the real gap rather
   than a setup error. This test is the deliverable — it outlives the fix and
   becomes the regression guard.
   - A failing test must not break the build for everyone else. Unless the
     fix follows in the same branch, mark it with the test framework's
     expected-failure mechanism (`xfail`, `test.fails`, `@Disabled` with a
     reason, …) citing `D-<n>` — the fix removes the marker, and the test
     must then pass. Never commit it as a plain failing test to a shared
     branch.
4. **Localize it.** Narrow where the cause lives before reasoning about why.
   Use whichever is cheapest:
   - Bisect the input: which argument, record, or request triggers it?
   - Bisect the code path: log or breakpoint at the boundaries, and find the
     first place where a value is already wrong.
   - Bisect history: if it used to work, find the commit where it stopped.
   - Bisect the environment: what differs between where it works and where
     it does not?
   Stop narrowing when you can name the function, the line, or the
   interaction where correct input becomes incorrect output.
5. **Form one hypothesis at a time.** Write it as a falsifiable statement:
   "the cause is X; if so, then Y must also be true." Then check Y.
   - One hypothesis, one check, one answer. Changing several things and
     re-running tells you nothing about which change mattered.
   - Record each hypothesis and whether it was confirmed or eliminated.
     Eliminated hypotheses are results, not wasted work.
6. **Prove the cause.** A cause is proven when it explains **everything**
   observed, not just the headline symptom: the error, the conditions under
   which it happens, the conditions under which it does not, and the
   intermittency rate if any. Demonstrate it — make the defect appear and
   disappear by manipulating the cause alone. Changes made to demonstrate
   it — a forced value, a patched line, extra logging — are temporary
   experiments: revert every one before the record is written, and confirm
   the working tree holds only the regression test.
   - If the cause explains the symptom but not why it only happens on
     Tuesdays, you have found *a* problem, not *the* cause. Keep going.
7. **Decide what is wrong: the code or the specification.** Now that the
   cause is known, classify it:
   - **Code defect** — the code does not do what was specified. Fix the code.
   - **Specification defect** — the code does what was specified, and what
     was specified is wrong or silent. The fix is a specification change
     first, then code; do not quietly implement a different behavior.
   - **Test defect** — the behavior is correct and the test asserts something
     wrong. Fix the test, and record why it was wrong, because a test that
     asserted the wrong thing may have been hiding a real defect.
8. **Write the defect record** using the template below. The fix itself is
   separate work: it changes the system, and it must be verified against the
   failing test this skill produced. Do not fix and diagnose in the same
   motion — the moment you start editing, you stop observing. Keep to the
   defect the user reported: other problems noticed along the way go in the
   record's blast radius or as separate findings, not into this change.
9. **Present the result, then offer a spec only where specs are in use.** Show
   the full result — the defect record, the proven cause, the failing
   regression test and how it is kept from breaking the build, the
   classification — in one place, and wait for the user's reaction. If nobody
   is there to respond (an automated or chained run), end here with the result
   reported and create nothing optional. Offer a spec file only if the project
   already keeps spec documents (`.specs/` or its own spec tool) or the user
   asked for one, and this work has none — and offer it at most once per
   session: a declined offer is not repeated, and the work stays
   context-driven. If the user agrees, write `.specs/<slug>/spec.md` from what
   this pass established — the expected behavior, the requirement (`R-<n>`) or
   acceptance criterion (`AC-<n>`) it maps to, and the test criteria (`TC-*`)
   the regression test proves — with `Status: Draft` and the standard spec
   sections (context, scope, non-scope, interface and data contracts,
   behaviour, error and edge cases, test criteria, observability, rollback
   plan, open questions). Only a human approves it, later. Anything still open
   goes into its open questions, not invented. Do not fix the defect here.

## Templates

Defect record, saved to `.specs/<slug>/defects/D-<n>.md` or returned in the
conversation — see Where output goes:

```markdown
# D-<n>: <one-line symptom>

> **Date:** <YYYY-MM-DD>
> **Severity:** <blocker / major / minor>
> **Status:** <cause proven / not reproducible / cause unproven>
> **Violates:** <R-<n> / AC-<n> / TC-U<n> / contract / documented behavior / none — see note>

## Gap

- **Expected:** <the specified or documented behavior, quoted>
- **Actual:** <the exact observed behavior, error, or wrong value>
- **Conditions:** <when it happens — environment, input, timing>
- **Rate:** <always / <n> in <m> runs>

## Reproduction

    <exact command or steps>
    <exact output>

Failing test: `<path::test_name>` — fails with `<assertion message>`.

## Hypotheses

| # | Hypothesis | Check | Result |
|---|---|---|---|
| 1 | <cause X> | <what must be true if X> | Eliminated — <what was observed instead> |
| 2 | <cause Y> | <what must be true if Y> | Confirmed — <evidence> |

## Cause

<The mechanism, in specific terms: which value, becoming wrong where, and
why. Names a location: file:line, function, or interaction.>

**Explains:** <symptom, conditions, non-occurrence, intermittency — each
accounted for.>

**Demonstration:** <how the defect was made to appear and disappear by
changing the cause alone.>

## Classification

<Code defect | Specification defect | Test defect> — <why>

## Fix direction

<What would have to change, and where. Not the fix itself.>

**Regression guard:** `<path::test_name>` must fail before the fix and pass
after.

## Blast radius

<Other call sites, inputs, or flows with the same cause. A cause that appears
once usually appears more than once.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can see what's wrong, I'll just fix it" | Then say what is wrong, out loud, as a falsifiable statement, and check it — that takes a minute. If you are right, you lost a minute. If you are wrong, you just avoided shipping a change that alters behavior for a reason nobody can name. The reading is the hypothesis, not the proof. |
| "The test is failing, so I'll adjust the test" | The test is the only thing currently claiming what the behavior should be. Changing it to match the code deletes the claim and certifies the bug. Prove the test is wrong before you touch it, and record why — a test asserting the wrong thing may have been masking a real defect. |
| "Adding a null check here makes the error go away" | The error is gone; the wrong value that reached this line is still being produced upstream, and now it travels further before surfacing. A guard at the crash site treats the messenger. Find where the value became wrong. |
| "It's flaky, re-running fixes it" | Flaky means non-deterministic, and non-deterministic means a race, a shared fixture, a clock, or an ordering dependency — all of which are real defects that will reappear in production at a worse moment. Record the rate and diagnose it. |
| "I changed three things and now it works" | You do not know which one mattered, whether the other two broke something else, or whether it was coincidence. Revert all three, change one, and find out. |
| "I can't reproduce it, but I know what it probably is" | A fix for a defect you never observed cannot be verified, because you have no way to tell whether it worked. Report the non-reproduction and what you tried. That is a real, honest result. |
| "The cause explains the error message, close enough" | Close enough means the parts it does not explain are still live. If your cause does not account for the conditions, the non-occurrence, and the rate, there is another mechanism in play and you have found only part of it. |
| "This is taking too long, I'll patch the symptom and move on" | The symptom patch is permanent and the cause is now documented nowhere. If time is genuinely out, say so explicitly, record the defect as cause unproven, and mark the patch as a mitigation — never as a fix. |

## Red Flags

- A fix is being written and no reproduction was recorded.
- The words "should be fine now" without a test that failed before.
- More than one thing changed between two runs.
- The reproduction is the full application when a unit would show it.
- The cause names no location — no file, function, or interaction.
- The explanation covers the error but not why it happens only sometimes.
- A test was edited during diagnosis.
- Logging was added and left in place instead of the cause being found.
- "Fixed" is claimed while the failing test was never run again.

## Verification

- [ ] The gap is stated as expected-versus-actual, both halves concrete.
- [ ] The defect was reproduced, with the exact command and output recorded — or non-reproduction is reported explicitly.
- [ ] A test exists that fails because of this defect, and was watched failing.
- [ ] The cause names a specific location, not a subsystem.
- [ ] Each hypothesis was recorded with its check and its result, including eliminated ones.
- [ ] The cause explains the symptom, the conditions, the non-occurrence, and the intermittency rate.
- [ ] The cause was demonstrated by making the defect appear and disappear.
- [ ] The defect is classified as a code, specification, or test defect.
- [ ] The defect record cites the `R-*`/`AC-*`/`TC-*` it violates, or states that no criterion covered this behavior.
- [ ] The blast radius was checked — other sites with the same cause.
- [ ] No fix was applied inside this skill, and no test was weakened.
- [ ] Every experimental change was reverted; the only code change left is the regression test, marked expected-failure unless the fix follows on the same branch.

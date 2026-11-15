---
name: spine-amend
description: Changes agreed requirements under control, with re-approval and a list of what the change invalidates. Use when requirements change after they were agreed, or the build shows the spec is wrong. Use when scope is added or dropped mid-build.
---

# Spine Amend

## Overview

Change agreed requirements without losing what approval guaranteed.
**Requirements are amended, never overwritten.** An amendment records the
change, the reason, the approver, and the downstream work it just made
wrong.

## When to Use

- The build showed the spec is wrong, incomplete, or impossible.
- A decision changed the requirements after approval.
- Scope is added, dropped, or renegotiated mid-flight.
- A contract the spec depends on changed.

**Not for:** requirements that were never agreed (edit the draft); a typo or
wording fix that changes no behavior (edit it and note it in the change
log); a new, separately shippable outcome (that is a new story).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Agreed requirements | approved `.specs/<slug>/spec.md`, or the list confirmed in the conversation | Stop. Nothing to amend. A Draft spec is edited directly. |
| Reason for the change | a person, a defect record, a failed build | Stop. Ask what is wrong and how it was found. |
| Downstream artifacts | plan, tasks, evidence, code, tests | Proceed. List what you could not check. |
| Human approver | a person | Stop before marking it approved. |

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

1. **State the trigger** in one or two sentences, with its evidence: a
   defect record, a failing contract, a decision and who made it.
2. **Classify the change:**
   - **Correction:** the spec was impossible or contradicted itself. The
     intent is unchanged.
   - **Clarification:** behavior was silent or ambiguous and is now pinned.
   - **Scope change:** a requirement is added, removed, or altered.
   - **Contract change:** an interface, schema, or data contract changes.
     List every consumer.
3. **Write the delta.**
   - Added: a new `R-<n>` continuing the numbering.
   - Changed: same ID, with before and after quoted.
   - Dropped: `R-<n> (dropped: reason)`. The line stays.
4. **Revisit the test criteria** of every added or changed `R-<n>`: add,
   change, or drop its `TC-*` to match.
5. **Name what is invalidated:**
   - slices `SL-*` already built on the old behavior;
   - tests that assert the old expectation (they pass and are wrong);
   - test evidence gathered against the old criteria;
   - estimates `T-*` that are now wrong;
   - merged code implementing the old behavior, and whether it stays or is
     reverted.
6. **Get re-approval.** Scope and contract changes need the approval the
   original needed, from someone other than the author. Corrections and
   clarifications need an approver's acknowledgement. Record name and date.
7. **Apply it.** With a spec file: update the body so it reads as the current
   requirements, and append the record to its `## Change log`. Without one:
   restate the full current list in the conversation with the record under
   it, and carry the record into the PR body.
8. **Report.** Do not re-plan, rebuild, or re-test here.

## Rules

- Never renumber, reuse, or delete an ID.
- The party who wants the change does not approve it.
- A small change to a contract can break every consumer. Classify by effect,
  not by size.
- Tests asserting the old expectation are listed as must-rewrite, never left
  green.
- An empty invalidation list on partly built work is a red flag. Recheck.
- The amendment is recorded before the code changes.
- Write the record on the Output template, with an `AM-<n>` ID, even when
  downstream work could not be found. What you could not verify goes under
  Not checked; it never replaces the record.

## Output

Append to `## Change log` in `.specs/<slug>/spec.md`, or give it in the
conversation and the PR body (contract rule 8).

```markdown
### AM-<n>: <short title>

> **Date:** <YYYY-MM-DD>
> **Type:** Correction | Clarification | Scope change | Contract change
> **Trigger:** <what forced this, with evidence>
> **Approved by:** <name, date> | PENDING

**Requirements**
| ID | Change | Before | After |
|---|---|---|---|
| R-4 | Changed | <old text> | <new text> |
| R-9 | Added | none | <new text> |
| R-2 | Dropped | <old text> | (dropped: <reason>) |

**Test criteria**
| ID | Change | Note |
|---|---|---|
| TC-I2 | Changed | now expects <new result> |

**Contracts affected:** <interface or schema and its consumers, or "none">

**Invalidated**
| Artifact | What is now wrong | Action |
|---|---|---|
| SL-3 (`<sha>`) | implements old R-4 | rebuild / revert / ships as-is |
| `<path::test>` | asserts old R-4 | rewrite from TC-I2 |
| <evidence file or run> | gathered on old criteria | re-verify |
| T-6 | estimate too low by ~<n> points | re-point |

**Not checked:** <artifacts not inspected and why, or "none">
```

## Verification

- [ ] The trigger is stated with evidence.
- [ ] The change is classified.
- [ ] Every affected requirement is added, changed (before and after), or
      dropped with a reason. No ID was reused, renumbered, or deleted.
- [ ] Every added or changed `R-*` had its `TC-*` revisited.
- [ ] The invalidation table covers slices, tests, evidence, estimates, and
      merged code, or says what was not checked.
- [ ] Re-approval names a person other than the author, with a date.
- [ ] The current requirements read as one coherent list.

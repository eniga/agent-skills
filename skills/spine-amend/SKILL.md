---
name: spine-amend
description: Changes agreed requirements under control by recording what changed and why, getting re-approval, and naming every slice, test, estimate, and piece of evidence the change invalidates. Use when requirements change after they were agreed. Use when implementation shows the spec is wrong, incomplete, or impossible. Use when scope is added or dropped mid-build.
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

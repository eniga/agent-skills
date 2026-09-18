---
name: spec-amend
description: Changes an approved specification under control, recording what changed and why, re-approving it, and naming every downstream artifact the change invalidates. Use when requirements change after a spec is approved. Use when implementation reveals the spec is wrong, incomplete, or impossible. Use when scope is added, dropped, or renegotiated mid-build.
---

# Spec Amend

## Overview

Change an approved spec without losing the guarantees approval gave it. An
amendment records what changed, why, who approved it, and — the part that is
always skipped — **which downstream work the change just invalidated**: the
slices already built, the tests already written, the estimates already given.

The defining rule: **requirements are amended, never overwritten.** An
approved spec that silently changes is a spec nobody approved. The history of
what was agreed, and when, is the reason anyone can trust the document at all.

## When to Use

- The build revealed the spec is wrong, incomplete, or impossible as written.
- A product decision changed the requirements after approval.
- Scope is being added, dropped, or renegotiated mid-flight.
- A diagnosis concluded the specification, not the code, was at fault.
- A contract the spec depends on changed underneath it.

**When NOT to use:** The spec is not approved yet (just edit it — there is no
agreement to amend). The change is a typo, formatting, or a clarification
that alters no behavior and no contract (edit it and say so in the change
log). The work is a new, independently shippable outcome (that is a new
story and a new spec, not an amendment to this one). You disagree with the
spec but nothing has changed (that is a discussion to have, not an amendment
to write).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The approved spec | `.specs/<slug>/spec.md` | Stop. There is nothing to amend. If the spec was never approved, edit it directly and get it approved. |
| The reason for the change | a person, a defect record, a failed build, a decision | Stop. "The spec is wrong" is not a reason; what is wrong, discovered how, is. |
| Downstream artifacts | `plan.md`, `tasks.md`, `evidence/`, the code and its tests | Proceed, but the invalidation analysis is the point of this skill. Without them, say explicitly which downstream work you could not check. |
| A human approver | a person | Stop before marking the amendment approved. An amendment self-approved by the party who wanted it is just an edit. |

## Process

1. **State the trigger.** Record what forced the change, in one or two
   sentences, with its evidence: the defect record, the failing contract,
   the decision and who made it. An amendment with no traceable trigger is
   someone changing their mind in the document.
2. **Classify the change.** This determines how much re-approval it needs:
   - **Correction** — the spec says something factually impossible or
     self-contradictory. Behavior intended is unchanged.
   - **Clarification** — behavior was ambiguous or silent; the amendment
     pins it down. No previously-agreed behavior changes.
   - **Scope change** — a requirement is added, removed, or materially
     altered. Someone agreed to something different now.
   - **Contract change** — an interface, schema, or data contract changes.
     This is the expensive one: other consumers may depend on it.
3. **Write the delta, never a silent rewrite.** For each affected item:
   - **Added:** new `R-<n>` continuing the existing numbering — never reuse a
     retired number.
   - **Changed:** keep the ID, record the before and the after verbatim.
   - **Dropped:** mark `R-<n> (dropped: reason)`. Do not delete the line.
     Traceability tables that reference it must still resolve.
4. **Propagate to test criteria.** Every changed or added `R-*` needs its
   `TC-*` revisited: criteria that no longer apply are marked dropped,
   criteria that changed get their new expectation, and new behavior gets new
   `TC-*`. A requirement whose test criteria were not revisited has not
   really been amended — the old expectation is still what gets tested.
5. **Name the invalidation.** This is the step that gets skipped, and the
   one that costs the most when it is. List explicitly:
   - **Slices** (`SL-*`) already built whose behavior is now wrong.
   - **Tests** already written that now assert the old expectation — these
     will pass and be wrong, which is worse than failing.
   - **Test evidence** that no longer proves anything, because it was
     gathered against the old criteria.
   - **Estimates** (`T-*`) that are now wrong, and by roughly how much.
   - **Code already merged** that implements the old behavior, and whether
     it ships as-is or gets reverted.
   Anything you cannot check, say you could not check.
6. **Get it re-approved.** Scope and contract changes need the same approval
   the original spec needed, from someone who is not you. Corrections and
   clarifications need an approver's acknowledgement. Record who approved it
   and when. **Do not mark an amendment approved on your own authority.**
7. **Apply the amendment to the spec.** Update the spec body so it reads as
   a current, coherent document — a reader should not have to reconstruct
   the current requirements from a pile of diffs — and append the amendment
   record to its change log. The body is the current truth; the log is how it
   got there.
8. **Return the amendment record** with the invalidation list, and stop. Do
   not re-plan, re-build, or re-test inside this skill: those are separate
   activities that now have a changed input.

## Templates

Amendment record, appended to a `## Change log` section at the end of
`.specs/<slug>/spec.md`:

```markdown
### AM-<n> — <short title>

> **Date:** <YYYY-MM-DD>
> **Type:** <Correction | Clarification | Scope change | Contract change>
> **Trigger:** <what forced this, with evidence — D-<n>, decision, failure>
> **Approved by:** <name, YYYY-MM-DD> (or: **PENDING — not yet approved**)

**Requirements**

| ID | Change | Before | After |
|---|---|---|---|
| R-4 | Changed | <old text> | <new text> |
| R-9 | Added | — | <new text> |
| R-2 | Dropped | <old text> | (dropped: <reason>) |

**Test criteria**

| ID | Change | Note |
|---|---|---|
| TC-I2 | Changed | now expects <new expectation> |
| TC-U7 | Added | covers R-9 |
| TC-E1 | Dropped | covered R-2, which is dropped |

**Contracts affected**

<Interface/schema changes and their consumers — or "none".>

**Invalidated by this amendment**

| Artifact | What is now wrong | Action |
|---|---|---|
| SL-3 (built, merged `<sha>`) | implements old R-4 behavior | rebuild / revert / ships as-is |
| `<path::test_name>` | asserts old R-4 expectation, will pass and be wrong | rewrite from new TC-I2 |
| `evidence/test-<date>.md` | gathered against old criteria | superseded; re-verify after rebuild |
| T-6 (3 points) | underestimated by ~2 points | re-point |

**Not checked:** <artifacts you could not inspect, and why — or "none">
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll just edit the spec, everyone knows what changed" | Everyone knows today. In three weeks the only record is the document, and the document will claim this was always the requirement. The change log is what lets a reviewer tell a decision from a drift. |
| "It's a small change, it doesn't need re-approval" | Small is a size, not a category. A one-word change to a contract can break every consumer. Classify it — if it changes agreed behavior or an interface, it needs the approval the original had. |
| "I'm the one building it, so I can approve my own amendment" | The approval gate exists precisely because the builder is the party most motivated to make the requirement easier. Self-approval converts a specification into a diary. |
| "I'll update the tests when I get to them" | The existing tests assert the old expectation and they currently pass. Until they are rewritten, your suite is actively certifying the behavior you just agreed to change. That is worse than a red build — it is a green one that lies. |
| "The already-merged code still works, so nothing is invalidated" | It works against the old requirement. "Works" is meaningless without naming which expectation it satisfies. Decide explicitly whether it ships as-is, and record the decision. |
| "Renumbering the requirements will make it tidier" | Every traceability table, commit message, test name, and PR description that cites `R-4` now points at something else. IDs are addresses, not labels. Numbers are never reused. |
| "The requirement is dropped, I'll delete the line" | A dropped requirement that vanishes makes every table referencing it unresolvable, and erases the fact that it was once agreed and then deliberately abandoned. Mark it dropped with a reason. |
| "The estimate doesn't need updating, we'll absorb it" | Absorbed scope is the mechanism by which a two-week project becomes a six-week one with nobody able to say when it happened. Re-point it, even roughly. |

## Red Flags

- An approved spec whose git history shows edits with no change-log entry.
- An amendment with no named trigger, or a trigger with no evidence.
- Requirements renumbered, or a dropped requirement deleted outright.
- Changed requirements whose `TC-*` were not revisited.
- An amendment with an empty invalidation list on a spec that is already
  partly built.
- "Approved by" naming the same person who wrote the amendment.
- Test evidence still cited as current after the criteria it measured changed.
- The amendment and the code change arriving in the same commit, so nobody
  can see which drove which.

## Verification

- [ ] The trigger is stated with evidence, not as an opinion.
- [ ] The amendment is classified as correction, clarification, scope change, or contract change.
- [ ] Every affected requirement appears as added, changed (before and after), or dropped with a reason.
- [ ] No ID was reused or renumbered; no dropped requirement was deleted.
- [ ] Every changed or added `R-*` has its `TC-*` revisited.
- [ ] The invalidation list names affected slices, tests, evidence, estimates, and merged code — or says what could not be checked.
- [ ] Tests asserting superseded expectations are identified as must-rewrite, not left green.
- [ ] Re-approval is recorded with a name and a date, by someone other than the author.
- [ ] The spec body reads as a current, coherent document, and the change log records how it got there.
- [ ] No re-planning, rebuilding, or re-testing was done inside this skill.

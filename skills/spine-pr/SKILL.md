---
name: spine-pr
description: Writes a pull request description from the branch diff, built around a traceability table that maps each requirement to its commits, tests, and evidence, with security impact, risk, rollback, and open items. Use when a tested change is ready to open or update a pull request. Use when a PR description does not show what was built and how it was proven.
---

# Spine PR

## Overview

Write a PR description a reviewer can trust without re-deriving it. **The
traceability table is the description: every requirement mapped to commit,
test, and evidence that covers the latest commit.** This skill opens or
updates the PR and never merges it.

## When to Use

- A change is built and tested and is ready for a PR.
- A PR description is missing traceability, or no longer matches the diff.

**Not for:** a change with no current test evidence (get it verified first);
a proposal with no code.

## Inputs

| Input | Where | If missing |
|---|---|---|
| Branch diff | git, against the base branch | Stop. Nothing to describe. |
| Current test evidence | evidence file, report in the conversation, CI for the head commit | Stop if absent, or older than the latest commit. |
| Requirements `R-*`, `TC-*`, rollback plan | spec, or the conversation | Proceed from the stated intent and say the PR has nothing to trace to. |
| Review and conformance verdicts | wherever they live | Proceed. Record "not reviewed" under Open items. |
| Tasks `T-*`, slices `SL-*` | `tasks.md`, `plan.md` | Proceed without the task column. |

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

1. **Read** every commit and changed file against the base branch, the
   requirements, the test evidence, and any review verdicts. Confirm the
   evidence covers the head commit. If it does not, stop.
2. **Collect the trace.** For each `R-*`: the commit that built it (slice
   commits carry `SL-<n>` and `R-<n>`), the `TC-*` that prove it, and the
   evidence. A requirement with no commit is Deferred, with a reason and a
   pointer. A commit with no requirement is plumbing (note it) or scope
   creep (flag it).
3. **Check the gates from the records, not from memory:** test verdict,
   review verdict and its Blockers, conformance verdict, CI gates. Anything
   not green goes under Open items with an owner.
4. **State the security impact.** Say whether the diff touches auth,
   permissions, input handling, secrets, personal data, dependencies, or
   CI/CD, and what was checked. Say "none" only after reading the diff for
   each.
5. **Scan the diff** for secrets, credentials, debug output, and unrelated
   files before it goes public. If you find any, do not push, open, or
   update the PR. Still write the description, with a **Stopped before
   publishing** line above the title naming each finding (`path:line`) and
   what must happen first, such as removing and rotating a secret. Add each
   finding to Open items.
6. **State risk and rollback:** the mechanism, the trigger, and what happens
   to data the new version wrote.
7. **Write the description** using Output, for a reviewer who has not seen
   the work. Open or update the PR with it, unless step 5 stopped
   publishing.
8. **Report.** Merging is a human decision.

## Rules

- Every cell is something a reviewer can open or search for: an ID, a short
  SHA, a link, a command. Never an adjective.
- The summary is three sentences: what, why, and where to look first.
- Deferred work is named with a reason and a pointer. Never dropped
  silently.
- Open items are listed with owners. Never hidden in prose.
- If the diff changed after the description was written, regenerate it.
- Evidence older than the latest commit is not evidence, however small the
  last change.
- Never merge, and never mark the PR approved.

## Output

Apply to the PR body. Save a copy to `.specs/<slug>/pr.md` when the project
keeps spec files (contract rule 8).

```markdown
# <title>

> **Branch:** <branch> -> <base> at `<head sha>`
> **Requirements:** `<spec path>` | agreed in conversation <date> | stated intent only

## Summary
<Three sentences: what this does, why, and what to look at first.>

## Traceability
| Req | Task | Commit | Test criteria | Evidence |
|---|---|---|---|---|
| R-1 | T-1 | `<sha>` | TC-U1, TC-I1 | <link or command>: pass |
| R-3 | T-3 | none | none | **Deferred:** <reason, pointer> |

Plumbing commits: `<sha>`: <what>, or "none"

## Test evidence
- **Report:** <link, CI run, or inline summary> for `<head sha>`
- **Verdict:** Proven | Partially proven: <gaps>
- **Full suite:** <result, command, count>

## Review
- **Review:** Approve | Approve with notes | Request changes | not reviewed
- **Conformance:** Conformant | With gaps | Non-conformant | not run
- **Accepted findings:** <ID and reason, or "none">

## Security impact
<Areas touched and what was checked, or "none: diff read for auth, input,
secrets, data, dependencies, CI/CD".>

## Risk and rollback
- **Risk:** <what could go wrong>
- **Rollback:** <mechanism, trigger, data consequences>

## Open items
- <failing gate, accepted risk, or unresolved note> | owner: <name>, or "none"
```

## Verification

- [ ] The evidence covers the head commit and its verdict is recorded.
- [ ] Every agreed `R-*` has a row: delivered with commit, `TC-*`, and
      evidence, or Deferred with a reason.
- [ ] Every commit maps to a requirement or is listed as plumbing.
- [ ] Security impact is stated from reading the diff.
- [ ] No secret, debug output, or unrelated file is in the diff, or the
      PR was not published and each finding heads the description.
- [ ] Review status, risk, rollback, and open items are filled in.
- [ ] The PR body was updated. The PR was not merged.

---
name: pr-prepare
description: Turns a branch diff and its spec into a pull request description with a traceability table mapping requirements to tasks, commits, tests, and evidence. Use when a change is ready to open or update a pull request. Use when a PR description needs to show what was built and how it was proven.
---

# PR Prepare

Turn a finished, tested, reviewed change into a pull request description a
reviewer can trust without re-deriving it. The center of the description is
the **traceability table**: every requirement the PR delivers, mapped to the
task that planned it, the commit(s) that built it, the test criteria that
prove it, and the evidence that was observed. A reviewer should be able to
read the table and know exactly what is claimed and what proves it.

## When to Use

- A change is built, tested, and reviewed and is ready to open (or update) a
  PR.
- A PR description exists but has no traceability — a reviewer cannot tell
  what is claimed or what proves it.
- A PR was updated after review and its description no longer matches the
  diff.

**When NOT to use:** The change is not tested (run `test` first — a PR
description with no evidence is a claim, not a proof). The change is not
reviewed (run `review` / `ai-code-review` first — the PR carries the verdicts,
it does not replace them). You are preparing a technical proposal with no
code (that is a design doc, not a PR).

## Process

1. **Read the inputs.** Read the branch diff (every commit and changed file
   relative to the base branch), the spec (`.specs/<slug>/spec.md`), the task
   list (`.specs/<slug>/tasks.md`) if it exists, the test report
   (`.specs/<slug>/evidence/`), and the review verdicts (`review`,
   `ai-code-review`) if they exist. If the test report is missing or older
   than the latest commit, stop and run `test` first — the PR must carry
   current evidence.
2. **Collect the traceability data.** For every requirement `R-*` the PR
   delivers, gather:
   - the task `T-*` that planned it (from `tasks.md`),
   - the commit(s) that implemented it (from the branch log — slice commits
     carry `SL-<n>` and `R-<n>` in their messages),
   - the test criteria `TC-*` that prove it (from the spec),
   - the evidence (from the test report: command, result).
   If a requirement has no commit, it is not delivered by this PR — say so
   (it is deferred, not silently dropped). If a commit has no requirement,
   investigate: it is either plumbing (note it) or scope creep (flag it).
3. **Check the gates.** Confirm, from the actual records (not memory):
   - the test report is current (newer than the latest commit) and its
     verdict is Proven or the gaps are named,
   - the review verdict is present and its Blockers are resolved,
   - the conformance verdict (if `ai-code-review` ran) is present and any
     non-conformances are resolved or accepted,
   - the `CONSTRAINTS.md` CI gates are expected to pass (lint, type check,
     coverage per the bar).
   A gate that is not green is a line in the PR's "Open items", not a
   hidden assumption.
4. **Write the PR description** to `.specs/<slug>/pr.md` using the template
   below, then apply it to the actual PR (update the PR body). The
   description is written for a reviewer who has not seen the work: no
   insider shorthand, every ID resolvable.
5. **Summarize the risk and the rollback.** Carry the spec's rollback plan
   into the PR: the mechanism, the trigger, and the data consequences. A
   reviewer deciding whether to merge needs to know what "undo" looks like.
6. **Return the description** in chat with the file path, and stop. Do not
   merge — opening the PR is the hand-off; merging is a separate, explicit
   decision.

## Writing rules

- **The table is the description.** The traceability table is the primary
  content. Prose (summary, risk, rollback) frames it; the table is what a
  reviewer checks.
- **Every row is resolvable.** Each cell names something a reviewer can
  click or grep: a task ID, a commit SHA (short form is fine), a `TC-*` ID,
  a link to the evidence. A row full of adjectives is a row that proves
  nothing.
- **Deferred work is named.** Requirements the spec has but the PR does not
  deliver get a "Deferred" section with a reason and a pointer (next PR,
  separate story). Silent omission is how scope disappears.
- **The summary is three sentences.** What the PR does, why, and what a
  reviewer should look at first. If the summary needs a paragraph, the table
  is not doing its job.
- **Open items are honest.** Failing gates, accepted risks, and unresolved
  review notes go in "Open items" with an owner. A PR that hides its open
  items gets them found in review, where they cost more.
- **The description matches the diff.** If the PR changed after the
  description was written, the description is stale — regenerate it. A stale
  traceability table is worse than none, because it is wrong with
  confidence.

## Template

```markdown
# PR: <title>

> **Branch:** <branch> → <base>
> **Spec:** `.specs/<slug>/spec.md`
> **Date:** <YYYY-MM-DD>

## Summary

<Three sentences: what this PR does, why, and what a reviewer should look at
first.>

## Traceability

| Req | Task | Commit(s) | Test criteria | Evidence |
|---|---|---|---|---|
| R-1 | T-1 | <sha> | TC-U1, TC-I1 | <test report link — pass> |
| R-2 | T-2 | <sha>, <sha> | TC-U2 | <test report link — pass> |
| R-3 | T-3 | — | — | **Deferred:** <reason, pointer> |

## Test evidence

- **Test report:** <link to `.specs/<slug>/evidence/test-<date>.md`>
- **Verdict:** Proven | Partially proven — <gaps>
- **Full suite:** <pass/fail, command, count>

## Review

- **Review verdict:** Approve | Approve with notes | Request changes — <link / date>
- **Conformance verdict:** Conformant | Conformant with gaps | Non-conformant — <link / date>
- **Resolved findings:** <count, or "none">
- **Accepted findings:** <ID + reason, or "none">

## Risk and rollback

- **Risk:** <what could go wrong, from the spec's risk section>
- **Rollback:** <mechanism, trigger, data consequences — from the spec>

## Open items

- <failing gate / accepted risk / unresolved note, with owner — or "none">

## Deferred

- <requirement not delivered by this PR, reason, pointer — or "none">
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The table is overkill, a summary is enough" | A summary is a claim; the table is the mapping from claim to proof. The reviewer's job is to check the mapping — without the table, they re-derive it from the diff, which is the hour you just took back from them. |
| "I'll fill in the evidence column later, after merge" | Evidence after merge is a post-hoc story. The PR is the record of what was proven when it was proven. A missing evidence cell is an open item, not a TODO. |
| "The test report is from before the last fix, but the fix was tiny" | The report is older than the latest commit, so it does not cover the latest commit. "Tiny" is the word that ships regressions. Re-run `test`, then write the PR. |
| "I'll leave the deferred requirement out, it's obvious" | "Obvious" to you is invisible to the reviewer and the next person who reads the spec. The Deferred section is where scope goes when it is not shipped — named, with a pointer, not deleted. |
| "The review had notes, but they're minor, I'll skip the Review section" | The Review section is the record that the notes were seen and dispositioned. Skipping it means the reviewer's time produced no record — and the next reviewer re-asks the same questions. |
| "I'll merge right after opening, no need for a clean description" | The description is read after merge too — by the person debugging this change in six months. The traceability table is the onboarding doc for the future incident. |

## Red Flags

- A traceability table with a requirement row but no commit and no Deferred
  marker.
- An evidence cell that is an adjective ("passing", "green") instead of a
  link or command.
- A test report older than the latest commit on the branch.
- A missing Review section when a review was performed.
- Deferred requirements absent from the description entirely.
- A rollback section that says "revert the deploy" with no data
  consequences.
- Open items hidden in prose instead of the Open items section.

## Verification

Before returning, confirm:

- [ ] The test report is current (newer than the latest commit) and its verdict is recorded.
- [ ] The traceability table has a row for every `R-*` the spec has: delivered (with task, commit, `TC-*`, evidence) or explicitly Deferred.
- [ ] Every commit on the branch maps to a requirement or is noted as plumbing.
- [ ] The Review section records the review and conformance verdicts and the disposition of findings.
- [ ] The Risk and rollback section carries the spec's mechanism, trigger, and data consequences.
- [ ] Open items are listed with owners, or the section says "none".
- [ ] The description was saved to `.specs/<slug>/pr.md` and applied to the PR body.
- [ ] The PR was opened or updated, but not merged.

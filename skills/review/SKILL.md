---
name: review
description: Reviews code changes before merge, checking correctness, security, regressions, complexity, tests, and docs, and suggesting improvements to code health. Use before merging any change. Use when a second opinion on a diff, branch, or PR is needed.
---

# Review

## Overview

Review a change before it merges. The goal is to find the defects that would
ship — correctness bugs, security holes, regressions, missing proof — and to
suggest the improvements that make the new code healthier, not to relitigate
taste. A review is a verdict with evidence, not a list of preferences.

## When to Use

- Before merging any change (branch, commit range, or PR).
- You want a second opinion on a diff you wrote or received.
- A change is about to ship and has not been reviewed.

**When NOT to use:** There is no code — the subject is a proposal, a design,
or an intent. Reviewing a plan is a different activity with different
questions (is this the right shape?) from reviewing a diff (does this code do
what it claims, safely?); do not substitute one for the other. If you need a
strict line-by-line mapping of the diff onto a spec's requirement IDs, that
is a narrower conformance pass than this one — this skill judges quality,
including things no spec mentions.

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The change under review | diff, branch, commit range, or PR | Stop. A review needs a named change; a whole-repository audit is different work. |
| Requirements and non-goals (`R-*`, `AC-*`, `NG-*`) | `.specs/<slug>/spec.md` or `story.md` | Proceed. Review against the change's own stated intent (PR description, commit messages, issue) and say in the report that no spec existed, so conformance was judged against intent. Findings then cite `—` instead of an ID. |
| Test evidence (a report with per-`TC-*` results) | `.specs/<slug>/evidence/` | Proceed, and record "no test report" as a finding — an unproven change is a reviewable defect, not a missing prerequisite. |
| Quality bar (`C-*` rules and gates) | `CONSTRAINTS.md` at repo root | Proceed. Judge against the repository's existing lint, type, and test configuration, and say no written bar existed. |

This skill reviews code. Every input above except the change itself is
optional; each one absent costs precision, not the review.

## Process

1. **Set the frame.** Identify the exact change under review: the diff,
   branch, commit range, or PR. Read the change summary, the linked spec or
   story if there is one, and the repository's rules (`CONSTRAINTS.md`,
   `AGENTS.md`, lint config). Name who is affected by the change. If there is
   no local change and no named target, say so and stop — do not substitute a
   whole-repo audit for a review of a change.
2. **Take the broad view first.** Before reading line by line, confirm the
   change belongs: does it deliver one reviewable outcome, does it match the
   stated intent, is the size reasonable? A change that is three changes in
   one, or that does not do what its description says, is reported before any
   line-level detail.
3. **Review the main behavior.** Read the files and flows that deliver the
   outcome. Check, in this order:
   - **Correctness:** does it do what the spec/story says, including the
     failure paths? Cite the `R-<n>` (or `AC-<n>` when there is no spec) the
     behavior belongs to.
   - **Security:** input validation, authn/authz, secrets, injection, unsafe
     deserialization, dependency risk.
   - **Regressions:** does it break existing behavior, contracts, or
     migrations?
   - **Data:** are migrations reversible where they should be, are there
     schema/contract changes that need coordination?
   - **Concurrency and operations:** races, idempotency, timeouts, what
     happens under load or partial failure.
4. **Review every changed line in context.** Read enough surrounding code to
   judge correctness, complexity, naming, comments, and style. For generated
   files or large data, inspect the source and spot-check the output. Keep
   findings within the change's scope — do not audit untouched code. If the
   change implements something the story marked `NG-<n>`, that is a
   scope finding, cited by its non-goal ID.
5. **Review the proof.** Check the tests:
   - Do they cover the changed behavior and the affected failure paths?
   - Do they assert observable behavior, not implementation details?
   - Were any assertions weakened, skipped, or mocked around to get green?
   - Is there a test report, and does it match the claims? Name the `TC-*`
     criteria still reported Fail or Unverified. If no report exists, that is
     itself a finding: the change is unproven.
6. **Check the constraints.** If `CONSTRAINTS.md` exists, confirm the change
   meets its rules, citing each one by its `C-<n>` ID. A violated block-rule
   is a finding; a violated warn-rule is a note.
7. **Suggest code-health improvements.** For the new code only, note
   complexity, duplication, naming, and dead code that would be cheap to fix
   now and expensive later. Record "this is too complex" as a finding with a
   suggested shape, rather than rewriting the code inline — a review that
   edits the code stops being an independent read of it.
8. **Assign severity and a verdict.** Label every finding (below) and reach
   a verdict: **Approve**, **Approve with notes**, or **Request changes**.
9. **Return the review** using the template below. Lead with the verdict and
   the blocking findings. Do not edit the code — a review reports, it does
   not fix.

## Severity labels

| Label | Meaning | Blocks merge? |
|---|---|---|
| **Blocker** | A defect that would ship: correctness, security, data loss, broken contract, missing required proof. | Yes |
| **Major** | A real problem with a workaround, or a significant health issue (large regression risk, missing tests on a new failure path). | Should |
| **Minor** | A clarity or small-health issue that is cheap to fix now. | No |
| **Nit** | A preference. The author may ignore it. | No |
| **FYI** | Information, no action requested. | No |

A finding without a severity is a comment. A Blocker must cite technical
evidence (a line, a scenario, a rule) — not taste.

Every finding also carries the ID it traces to: `R-<n>` or `AC-<n>` for
behavior, `NG-<n>` for scope, `TC-*` for missing proof, `C-<n>` for a
constraint. A finding with no ID is a style note, not a finding — record it
under Notes. Use `—` only when the change has no spec or story at all.

## Verdict rules

- **Approve** — no Blockers, no unresolved Majors. The change is safe to
  merge.
- **Approve with notes** — no Blockers; Majors are acknowledged and accepted
  by the author with a reason (recorded), or are scheduled as follow-ups.
- **Request changes** — one or more Blockers, or unresolved Majors the author
  has not accepted.

The verdict is independent evidence. It is not a GitHub approval and not a
replacement for human review — it is the record of what a fresh read found.

## Template

```markdown
# Review: <change / PR>

> **Date:** <YYYY-MM-DD>
> **Change:** <branch / PR / commit range>
> **Spec:** `.specs/<slug>/spec.md` (or: none)
> **Reviewer:** <fresh agent / name>

## Verdict

**Approve | Approve with notes | Request changes**

<One or two sentences: the outcome the change delivers and the state it is
in.>

## Blocking findings

| # | Severity | ID | Location | Finding | Evidence | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | Blocker | R-4 | <file:line> | <what is wrong> | <scenario / rule / line> | <concrete fix> |
| 2 | Major | NG-2 | <file:line> | <in-scope creep: builds a non-goal> | <spec reference> | <remove / defer> |

## Code-health suggestions (new code only)

| # | Severity | Location | Suggestion | Routes to |
|---|---|---|---|---|
| 1 | Minor | <file:line> | <clarity / complexity / duplication> | code-simplify |

## Proof check

- Tests cover changed behavior: <yes/no, detail>
- Failure paths tested: <yes/no, detail>
- Assertions weakened or skipped: <none / detail>
- Test report present and consistent: <yes/no>
- Criteria still Fail or Unverified: <TC-* list, or "none">

## Constraints check

| ID | Rule | Met? |
|---|---|---|
| C-1 | <rule, per CONSTRAINTS.md> | <met / violated — block or warn> |

<Or: "no CONSTRAINTS.md — no written quality bar; judged against the
repository's existing lint, type, and test configuration.">

## Notes

<Nits, FYI, and context a merger should know.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It looks fine, I'll approve" | "Looks fine" from one fast read is not a review. The failure paths and the security boundaries are exactly where the fast read skips. Review the proof, not just the happy path. |
| "I wrote this code, so I can review it" | The author is the worst reviewer of their own change — they know what they meant, not what they wrote. A review is most valuable from a fresh read that does not carry the intent. |
| "These nits are annoying, I'll make them Blockers so they get fixed" | Inflating severity trains the team to ignore the label. A Blocker is a defect that ships; a nit is a preference. Keep them separate or the verdict loses meaning. |
| "I'll fix the issue inline while I review" | A review that edits the code is no longer independent — it is the author's second pass. Report the finding; let the author (or a separate change) fix it. |
| "The tests pass, so the proof is fine" | Passing tests are necessary, not sufficient. The proof check asks whether the tests cover the changed behavior and failure paths — a green suite on the wrong assertions proves nothing. |
| "I'll review the whole repo while I'm here" | The review is of the change. Auditing untouched code buries the real findings in pre-existing issues and makes the review about the repo, not the diff. |

## Red Flags

- A verdict with no findings and no proof check (a rubber stamp).
- A Blocker with no technical evidence — only "this seems wrong".
- Severity inflation (nits labeled Blocker) or deflation (Blockers labeled Minor).
- Findings on untouched code presented as part of the change.
- A review that edited the code it reviewed.
- "Tests pass" used as the entire proof check.
- A whole-repo audit substituted for a change with no named target.

## Verification

Before returning, confirm:

- [ ] The exact change under review is named (diff, branch, range, or PR).
- [ ] The broad view was taken first: one outcome, matches intent, reasonable size.
- [ ] Correctness, security, regressions, data, and concurrency/operations were each checked for the changed flows.
- [ ] Every changed line was read in context; generated files were spot-checked.
- [ ] The proof check covers changed behavior, failure paths, weakened assertions, and the test report.
- [ ] `CONSTRAINTS.md` rules were checked by `C-<n>` if the file exists.
- [ ] Every finding has a severity, a location, a traceability ID (`R-`/`AC-`/`NG-`/`TC-`/`C-`), and (for Blockers) technical evidence.
- [ ] The verdict follows the verdict rules and leads the report.
- [ ] No code was edited — the review is a report, not a fix.

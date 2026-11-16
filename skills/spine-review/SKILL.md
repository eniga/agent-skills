---
name: spine-review
description: Reviews a code change for correctness, security, broken contracts, and unnecessary change, and returns findings by severity with a verdict. Use when a change, branch, diff, or PR is about to merge, or someone asks whether it is safe, ready, or good to merge, even for a quick look. Not for designs before code exists.
---

# Spine Review

## Overview

Find the defects that would ship: wrong behavior, security holes, broken
contracts, regressions, and missing proof. **A review is a verdict with
evidence, not a list of preferences, and it never edits the code.**

## When to Use

- Before merging a branch, commit range, or PR.
- A second opinion on a diff is wanted.

**Not for:** a design or proposal with no code; a whole-repository audit; a
strict requirement-by-requirement conformance matrix (a narrower pass).

## Inputs

| Input | Where | If missing |
|---|---|---|
| The change | diff, branch, range, PR | Stop. A review needs a named change. |
| Requirements `R-*`, `AC-*`, `NG-*` | spec, story, conversation | Proceed against the change's stated intent and say so. Findings cite `-` for the ID. |
| Test evidence | `.specs/<slug>/evidence/`, CI, the PR | Proceed. "No test evidence" is a finding. |
| Quality bar `C-*` | `CONSTRAINTS.md` | Proceed against the repository's lint, type, and test setup. |
| Earlier review of this change, and the answers to it | review report, PR comments, the conversation | Proceed as round 1. |

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

1. **Set the frame.** Name the exact change. Read its description, the
   linked requirements, the repository rules, and any earlier review of it.
2. **Get a fresh reader.** If this session wrote or discussed the code and
   can start a subagent, run steps 3 to 9 in one. Give it these
   instructions, the change, the requirements, the test evidence, any
   earlier review, and `CONSTRAINTS.md`. Never give it the conversation.
   Retry once if it fails; then review yourself and record the fresh review
   as not run. A same-session review is weaker and the report says so: base
   every Blocker on a command you run or a line you reread now.
3. **Carry earlier findings forward.** Give each one a status. **Settled:**
   contested with evidence, or a Major accepted with a reason; do not reopen
   it when raised again at the same place. **Fixed:** recheck it; if it is
   back, reopen it, because the fix failed. A new finding that undoing an
   earlier fix would resolve is **churn**: report both and ask which way.
4. **Take the broad view first.** Before reading the description, restate in
   two sentences what the diff does, then compare it with the stated intent.
   One outcome? Reasonable size? A change that is several changes, or does
   not do what it claims, is reported before any line detail.
5. **Check the behavior,** reading every changed line, the callers of what
   it changes, and the code it calls. A change can break untouched code:

   | Area | Look for |
   |---|---|
   | Correctness | Does what the requirement says, including failure paths and edge values (empty, zero, last item, rounding, time zones). A fix made in one caller while the shared code stays broken. |
   | Security | Unvalidated input, injection, missing or wrong authorization, secrets in code or logs, unsafe deserialization, weak crypto, sensitive data exposed. Untrusted data written into another format without encoding: HTML, SQL, shell, CSV opened in a spreadsheet. |
   | Supply chain | New or upgraded dependencies: needed, pinned, maintained, licence. CI, build, or infrastructure changes: permissions and secrets. |
   | Contracts | Callers of every changed function, type, endpoint, or schema still work. Flag narrower inputs, changed outputs, new errors, new side effects. |
   | Regressions and data | Existing behavior broken; migrations reversible; schema changes coordinated. |
   | Scale and operations | Judged against the load the project expects (README, deploy config; state your assumption if neither says): check-then-write races, the same work done by every process, lists or memory that only grow, a query per item, quadratic work on large input, per-process state that must be shared. Idempotency, timeouts, retries, partial failure, logging and metrics for the new path. |

6. **Check the size of the change.** Flag hunks that serve no requirement:
   drive-by refactors, renames, reformatting, unrequested helpers,
   abstractions, options, or dependencies. Flag new code that duplicates
   something the repository already has, naming the existing code. Flag
   anything built from an `NG-<n>`.
7. **Check the proof.** Do tests cover the changed behavior and its failure
   paths? Do they assert observable behavior? Was any assertion weakened,
   skipped, or mocked around? Does the test evidence cover the latest
   commit? Name every `TC-*` still Fail or Unverified.
8. **Check `CONSTRAINTS.md`** rule by rule, citing `C-<n>`.
9. **Label every finding and decide the verdict** using the tables in
   Output.
10. **Report,** verdict and blocking findings first. Pass a fresh reader's
    findings on unchanged: add, never drop or downgrade. At round 5 with a
    Blocker or Major open, ask: accept, keep going, or back to design?

## Rules

- Review the change, not the repository. Untouched code is out of scope
  unless the change breaks it.
- A Blocker or Major names a concrete case, "this input gives this wrong
  result", or a rule, confirmed by rereading the lines. No case, no finding.
- Do not inflate nits to Blockers or soften Blockers to notes.
- "The tests pass" is not the proof check. Check what they assert.
- Suggest the fix; do not apply it. A review that edits is no longer
  independent.
- Findings on new code, or code it breaks. A finding without a location is
  a note. Suggest a simpler shape; do not demand a rewrite for taste.
- A settled finding stays settled. A fixed one is checked again, never
  assumed.

## Output

| Severity | Meaning | Blocks merge |
|---|---|---|
| Blocker | Would ship a defect: wrong behavior, security hole, data loss, broken contract, missing required proof. | Yes |
| Major | A real problem with a workaround, or a serious risk such as an untested failure path. | Unless accepted |
| Minor | Cheap clarity or health fix. | No |
| Nit | A preference. | No |

**Approve:** no Blockers, no open Majors. **Approve with notes:** no
Blockers; each Major accepted with a recorded reason or scheduled.
**Request changes:** any Blocker, or a Major not accepted.

```markdown
# Review: <change>

> **Date:** <YYYY-MM-DD>
> **Change:** <branch / PR / range> at `<head sha>`
> **Requirements:** <spec path | agreed in conversation | stated intent only>
> **Reviewer:** fresh context | same session as the author (fresh review: not run, <reason>)
> **Round:** 1 | <n>, after <earlier review>
> **Load assumed:** <load>, from `<path>` | assumed

## Verdict
**Approve | Approve with notes | Request changes**
<One or two sentences: what the change delivers and its state.>

## What the diff does
<Two sentences, from the code. Matches the stated intent: yes | no, how.>

## Earlier findings
| # | Was | Now | Evidence |
|---|---|---|---|
| <n> | <severity: finding> | fixed | still open | settled | reopened | churn | `<file:line>` or reason |

## Findings
| # | Severity | ID | Location | Finding | Evidence | Suggested fix | If skipped |
|---|---|---|---|---|---|---|---|
| 1 | Blocker | R-4 | `<file:line>` | <what is wrong> | <input → wrong result / rule> | <smallest fix> | <what users or operators see> |
| 2 | Major | NG-2 | `<file:line>` | <builds a non-goal> | <reference> | <remove / defer> | <cost of keeping it> |

## Unnecessary change
- `<file:line>`: <hunk that serves no requirement, or duplicates `<path>`> or "none"

## Proof
- Changed behavior and failure paths tested: <yes / no, detail>
- Assertions weakened or skipped: <none / detail>
- Evidence covers latest commit: <yes / no>
- Still Fail or Unverified: <TC-* list, or "none">

## Constraints
| ID | Rule | Met? |
|---|---|---|

## Notes
<Nits and context for whoever merges.>
```

## Verification

- [ ] The change and the reviewer's independence are named. A fresh
      reader's findings were passed on unchanged.
- [ ] The broad view came first, with a restatement of what the diff does.
- [ ] On a later round, every earlier finding has a status.
- [ ] All six areas in step 5 were checked for the changed flows.
- [ ] Callers and callees of changed contracts were checked; load is named.
- [ ] Unnecessary and duplicate change was looked for.
- [ ] The proof check covers tests, weakened assertions, and evidence age.
- [ ] Every finding has severity, ID, location, and evidence; each Blocker
      and Major a concrete case and what happens if skipped.
- [ ] The verdict follows the rules and leads the report. No code was edited.

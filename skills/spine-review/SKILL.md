---
name: spine-review
description: Reviews a code change before merge for correctness, security, broken contracts, regressions, unnecessary change, and missing proof, and returns severity-labelled findings with evidence and a verdict. Use before merging any change. Use when a diff, branch, or PR needs a second opinion. Not for reviewing designs or proposals before code exists.
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

1. **Set the frame.** Name the exact change. Read its description, the
   linked requirements, and the repository rules. Record whether you are a
   fresh reader or the session that wrote the code. A same-session review is
   weaker and the report says so.
2. **Take the broad view first.** One outcome? Matches the stated intent?
   Reasonable size? A change that is several changes, or does not do what it
   claims, is reported before any line detail.
3. **Check the behavior,** reading every changed line with enough
   surrounding code to judge it:

   | Area | Look for |
   |---|---|
   | Correctness | Does what the requirement says, including failure paths and edge values. |
   | Security | Unvalidated input, injection, missing or wrong authorization, secrets in code or logs, unsafe deserialization, weak crypto, sensitive data exposed. |
   | Supply chain | New or upgraded dependencies: needed, pinned, maintained, licence. CI, build, or infrastructure changes: permissions and secrets. |
   | Contracts | Callers of every changed function, type, endpoint, or schema still work. Flag narrower inputs, changed outputs, new errors, new side effects. |
   | Regressions and data | Existing behavior broken; migrations reversible; schema changes coordinated. |
   | Operations | Races, idempotency, timeouts, retries, behavior under partial failure, logging and metrics for the new path. |

4. **Check the size of the change.** Flag hunks that serve no requirement:
   drive-by refactors, renames, reformatting, unrequested helpers,
   abstractions, options, or dependencies. Flag new code that duplicates
   something the repository already has, naming the existing code. Flag
   anything built from an `NG-<n>`.
5. **Check the proof.** Do tests cover the changed behavior and its failure
   paths? Do they assert observable behavior? Was any assertion weakened,
   skipped, or mocked around? Does the test evidence cover the latest
   commit? Name every `TC-*` still Fail or Unverified.
6. **Check `CONSTRAINTS.md`** rule by rule, citing `C-<n>`.
7. **Label every finding and decide the verdict** using the tables in
   Output.
8. **Report,** leading with the verdict and the blocking findings.

## Rules

- Review the change, not the repository. Untouched code is out of scope.
- A Blocker cites a line, a scenario, or a rule. Never "this seems wrong".
- Do not inflate nits to Blockers or soften Blockers to notes.
- "The tests pass" is not the proof check. Check what they assert.
- Suggest the fix; do not apply it. A review that edits is no longer
  independent.
- Findings on new code only. Suggest a simpler shape; do not demand a
  rewrite for taste.
- A finding without an ID or a location is a note.

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
> **Reviewer:** fresh context | same session as the author

## Verdict
**Approve | Approve with notes | Request changes**
<One or two sentences: what the change delivers and its state.>

## Findings
| # | Severity | ID | Location | Finding | Evidence | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | Blocker | R-4 | `<file:line>` | <what is wrong> | <scenario / rule> | <concrete fix> |
| 2 | Major | NG-2 | `<file:line>` | <builds a non-goal> | <reference> | <remove / defer> |

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

- [ ] The change and the reviewer's independence are named.
- [ ] The broad view came first.
- [ ] All six areas in step 3 were checked for the changed flows.
- [ ] Callers of every changed contract were checked.
- [ ] Unnecessary and duplicate change was looked for.
- [ ] The proof check covers tests, weakened assertions, and evidence age.
- [ ] Every finding has severity, ID, location, and evidence.
- [ ] The verdict follows the rules and leads the report. No code was edited.

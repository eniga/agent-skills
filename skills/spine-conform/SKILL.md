---
name: spine-conform
description: Checks a diff against its agreed requirements row by row and returns a conformance matrix and verdict, showing what was implemented, what is missing, what differs from the contract, and what was built without being asked. Use when a PR needs a spec-conformance check. Use when you need to know whether a diff implements exactly what was specified.
---

# Spine Conform

## Overview

Answer one question: **does the diff implement what was agreed, no more and
no less?** The output is a matrix with one row per requirement, each
pointing at lines. This pass does not judge code quality and never edits
the diff.

## When to Use

- A PR needs a conformance check before or alongside human review.
- The requirements changed mid-build and you need to know what drifted.

**Not for:** work with no written expectations anywhere; requirements that
are not agreed (a Draft spec or an unconfirmed list); judging clarity,
complexity, or style.

## Inputs

| Input | Where | If missing |
|---|---|---|
| The diff | PR, branch, commit range | Stop. Ask which diff. |
| Agreed requirements `R-*`, `NG-*`, `TC-*`, contracts | `.specs/<slug>/spec.md` and its change log, or the conversation | Use the closest written expectations (story `AC-*`, documented contract) and label the verdict with what it was measured against. Stop if none exist, or if the spec is Draft. |
| PR scope `SL-*` | plan, PR description, commit messages | Proceed. Treat every agreed `R-*` as in scope and say so. |

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

1. **Read** the agreed requirements in full, then the complete diff: every
   changed file, not a sample. Record whether you are a fresh reader or the
   session that wrote the code.
2. **Fix the scope.** From the plan, PR description, or `SL-<n>` in commit
   messages, decide which requirements this diff is meant to deliver.
3. **Build the matrix.** Give every `R-*` exactly one state:

   | State | Means |
   |---|---|
   | Implemented | The diff satisfies it and you can point at the lines. |
   | Partial | Some of it is there. Name the missing part. |
   | Not implemented | No hunk addresses it. |
   | Cannot verify | The diff does not touch it. Say what would verify it. |
   | Deferred | Out of this diff's scope. Say where it is planned. |
   | Dropped | Marked dropped by an amendment. Code for it is a finding. |

4. **Check for unrequested behavior.** For each significant hunk, find the
   `R-*` it serves. A hunk serving none is **plumbing** (imports, wiring,
   test scaffolding for an implemented requirement) or **unspecified**.
   Unspecified behavior is a finding, and more so when an `NG-*` excludes
   it.
5. **Check the contracts.** Compare field names, types, error responses,
   state transitions, and migration direction against the agreed contracts.
   Any difference is a finding.
6. **Check the test criteria.** Every in-scope `TC-*` needs a matching test
   in the diff: same setup, action, and expected result. A missing test is a
   finding. A test matching no `TC-*` is noted as extra coverage.
7. **Write the comments,** each mapped to an `R-*`, `NG-*`, or `TC-*`. A
   comment with no ID is a quality note and goes under Notes.
8. **Decide the verdict:**
   - **Conformant:** every in-scope `R-*` is Implemented (or Cannot verify
     with a named check), contracts match, every in-scope `TC-*` has a test,
     nothing unspecified.
   - **Conformant with gaps:** nothing is contradicted, but something
     in-scope is Partial, Not implemented, or untested.
   - **Non-conformant:** a requirement or contract is implemented
     differently than agreed, or non-scope or dropped behavior was built.
9. **Report,** leading with the verdict and the non-conformances.

## Rules

- One row per `R-*`, no exceptions. A missing row is a failed check.
- Implemented means a file and lines. If you cannot point, it is Cannot
  verify.
- There is no "mostly implemented". Partial names the missing part.
- A contract difference is a non-conformance until the requirements change,
  even if it looks better.
- Useful but unrequested behavior is still a finding.
- The PR description is the author's summary. It is not the requirements.
- Quality problems do not change the verdict. Record them under Notes.

## Output

Return in the conversation, or save alongside the project's review records
(contract rule 8).

```markdown
# Conformance: <PR>

> **Date:** <YYYY-MM-DD>
> **Diff:** <PR / branch> at `<head sha>`
> **Measured against:** approved spec `<path>` | agreed in conversation <date> | <other>
> **Scope:** <SL-* in this diff, or "all requirements">
> **Reviewer:** fresh context | same session as the author

## Verdict
**Conformant | Conformant with gaps | Non-conformant**
<One or two sentences.>

## Matrix
| Req | State | Location | Notes |
|---|---|---|---|
| R-1 | Implemented | `<file:lines>` | <one line> |
| R-2 | Partial | `<file:lines>` | <missing part> |
| R-5 | Deferred | n/a | <planned in SL-n> |

## Contracts
- Interfaces: <match | mismatch detail>
- Data: <match | mismatch detail>

## Test criteria
| TC | Matching test | Notes |
|---|---|---|
| TC-U1 | `<file:lines>` or missing | <one line> |

## Unrequested behavior
- `<file:lines>`: plumbing | unspecified: <detail>, or "none"

## Comments
| # | Maps to | Location | Comment | Conformance requires |
|---|---|---|---|---|

## Notes
<Quality observations and extra-coverage tests.>
```

## Verification

- [ ] The requirements are agreed and the complete diff was read.
- [ ] The matrix has exactly one row per `R-*`, each in one state.
- [ ] Every Implemented row points at a file and lines.
- [ ] Interface and data contracts were both compared.
- [ ] Every in-scope `TC-*` has a row.
- [ ] Every significant hunk was classified.
- [ ] Every comment maps to an ID.
- [ ] The verdict matches the matrix. The diff was not edited.

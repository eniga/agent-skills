---
name: spine-conform
description: Checks a diff against its agreed requirements and returns a conformance matrix and verdict. Use when a PR needs a spec-conformance check, or you need to know whether a diff builds exactly what was agreed.
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

1. **Read** the agreed requirements in full, then the complete diff: every
   changed file, not a sample.
   If this session wrote or discussed the code and can start a subagent, run
   steps 2 to 8 in one. Give it these instructions, the diff, and the
   requirements, never the conversation, and report its matrix unchanged.
   Retry once if it fails; then do the pass yourself, record the fresh pass
   as not run, and cite lines you reread now for every Implemented row.
2. **Fix the scope.** From the plan, PR description, or `SL-<n>` in commit
   messages, decide which requirements this diff is meant to deliver.
3. **Build the matrix.** Give every `R-*` exactly one state:

   | State | Means |
   |---|---|
   | Implemented | The diff satisfies it and you can point at the lines. |
   | Partial | Some of it is there. Name the missing part. |
   | Not implemented | No hunk addresses it. |
   | Cannot verify | The diff does not touch it. Say what would verify it. |
   | Deferred | Out of this diff's scope, and you can cite where it is planned. No citation: Not implemented. |
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
> **Reviewer:** fresh context | same session as the author (fresh pass: not run, <reason>)

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

- [ ] The requirements are agreed and the complete diff was read, by a
      fresh reader where one could be started.
- [ ] The matrix has exactly one row per `R-*`, each in one state.
- [ ] Every Implemented row points at a file and lines.
- [ ] Interface and data contracts were both compared.
- [ ] Every in-scope `TC-*` has a row.
- [ ] Every significant hunk was classified.
- [ ] Every comment maps to an ID.
- [ ] The verdict matches the matrix. The diff was not edited.

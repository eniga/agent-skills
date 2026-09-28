---
name: ai-code-review
description: Checks a PR diff against its spec — or the requirements agreed in the conversation when the project keeps no specs — and returns a conformance verdict with review comments mapped to requirement and test-criterion IDs. Use when a PR needs a spec-conformance check before or alongside human review. Use when you need to know whether the diff actually implements what was specified.
---

# AI Code Review

## Overview

Check whether a PR diff conforms to its spec. This is the spec-mapping pass:
it answers one question — **does the diff implement what was specified, no
more and no less?** — and returns a conformance verdict with comments mapped
to requirement and test-criterion IDs. It is deliberately narrow: a general
quality review asks "is this code good?", and this pass asks only "does this
code do what the spec says?". Run it alongside a quality review, not instead
of one — a fully conformant diff can still be badly written.

## When to Use

- A PR is open and needs a spec-conformance check before or alongside human
  review.
- You need to know whether the diff implements every requirement — and
  whether it implements anything that was not specified.
- A spec changed after the build started and you need to know what drifted.

**When NOT to use:** There is no spec and no written expectations anywhere
in the context (no story acceptance criteria, no documented contract, no
stated intent) — conformance has nothing to measure against, and a general
quality review is the right pass instead. You want
judgement on clarity, complexity, security, or style; this pass deliberately
does not give it. The requirements are not agreed — a `Draft` spec, or a list
nobody confirmed (conforming to a draft is not a meaningful verdict — get it
approved or confirmed first).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| An approved spec (`R-*`, `NG-*`, `TC-*`, contracts) | `.specs/<slug>/spec.md` | If the spec file is absent, proceed against the requirements agreed in the conversation (see Agreed expectations); failing that, against the closest written expectations — the story's `AC-*`, documented contracts, the PR's stated intent — and label the verdict with what it was measured against. If the spec file exists but is `Draft`, stop and say so (conforming to a draft is not a meaningful verdict). If no expectations exist anywhere in the context, stop: there is nothing to measure. |
| The PR's intended scope (`SL-*` slices, or requirements it defers) | `plan.md`, the PR description, commit messages, or the conversation | Proceed, and treat every agreed `R-*` as in scope for this PR. Say so in the report — a PR that deliberately ships part of the work should name its slices so the rest can be marked Deferred. |
| The PR diff | PR, branch, or commit range | Stop. Ask which diff is being checked. |
| The story's acceptance criteria (`AC-*`) | `.specs/<slug>/story.md` | Proceed. `R-*` carries the requirement; `AC-*` adds the user-facing phrasing when it exists. |
| Test evidence | `.specs/<slug>/evidence/` | Proceed. This skill checks that a test matching each `TC-*` exists in the diff, which is a different question from whether it passed. |

**Agreed expectations.** Requirements count as agreed when a spec file says
`Status: Approved` with an approver, or — in context-driven work, with no spec
file — when the user has explicitly confirmed a restated list of the
requirements or acceptance criteria in the conversation. A spec file that is
still `Draft` is not agreed, and neither is a list the user never confirmed.

## Process

1. **Read the requirements and the diff.** Read the agreed requirements in
   full — `R-*`, non-scope `NG-*`, test criteria `TC-*`, interface and data
   contracts — from `.specs/<slug>/spec.md`, including its change log, or from
   the conversation. Then read the complete PR diff (every changed file, not
   a sample). If the requirements are not agreed, stop and say so. Record
   whether this review runs in a fresh context or in the session that wrote
   the code — a same-session check is weaker and the report says so.
2. **Fix the PR's scope.** From the plan, the PR description, or the commit
   messages (`SL-<n>`), determine which requirements this PR is meant to
   deliver. Requirements assigned to later slices or explicitly deferred are
   out of this PR's scope; with no such signal, all agreed requirements are
   in scope.
3. **Build the conformance matrix.** For every `R-*`, find the diff hunk(s)
   that implement it. Record:
   - **Implemented** — the diff contains code that satisfies the requirement,
     and you can point at the lines.
   - **Partially implemented** — some of the requirement is there; name the
     missing part.
   - **Not implemented** — no diff hunk addresses it.
   - **Cannot verify** — the requirement is about behavior the diff does not
     touch (e.g. an operational requirement); say what would verify it.
   - **Deferred** — out of this PR's scope (step 2); name where it is
     planned. Not a gap.
   - **Dropped** — marked `(dropped: reason)` by an amendment. Must *not* be
     implemented; code for it is a finding.
   Every `R-*` gets exactly one of these states. A matrix with a requirement
   missing is a failed review, not a clean one.
4. **Check for scope creep.** For every significant diff hunk, find the
   `R-*` it implements. Hunks that implement no requirement are either
   - **Justified** — they are required plumbing (imports, wiring, test
     scaffolding) for an implemented requirement, or
   - **Unspecified** — they add behavior the spec does not ask for.
   Unspecified behavior is a finding: it is scope creep, and it includes
   "helpful" extras the spec's non-scope (`NG-*`) explicitly excluded.
5. **Check the contracts.** Compare the diff's interfaces and data shapes
   against the agreed interface and data contracts: field names, types, error responses,
   state transitions, migration direction. A contract that differs from the
   spec is a finding even if the difference "seems better" — the spec is the
   contract, and changing it is a spec change, not an implementation detail.
6. **Check the test criteria.** For every in-scope `TC-*`, confirm
   the diff contains a test that matches it (setup, call, assertion per the
   spec's wording). A `TC-*` with no matching test is a finding — the spec
   said this behavior must be proven, and the proof is missing. A test that
   matches no `TC-*` is noted (it may be good extra coverage; label it as
   such).
7. **Write the comments.** Each finding becomes a review comment mapped to
   its ID: which `R-*`, `NG-*`, or `TC-*` it concerns, where in the diff,
   what is wrong, and what conformance would require. A comment that cannot
   name an ID is a quality observation, not a conformance finding — put it
   under Notes for the quality review to pick up, and keep it out of the
   verdict.
8. **Reach the conformance verdict.**
   - **Conformant** — every in-scope `R-*` is Implemented (or Cannot verify
     with a named verification), every contract matches, every in-scope
     `TC-*` has a matching test, and there is no unspecified behavior.
     Deferred requirements do not count against it.
   - **Conformant with gaps** — no requirement is contradicted, but one or
     more in-scope requirements are Partially/Not implemented or lack their
     `TC-*` test. The gaps are listed; the PR is not done.
   - **Non-conformant** — the diff contradicts the spec: a requirement is
     implemented differently than specified, a contract differs, or
     non-scoped or dropped behavior was built. This is a stop: the spec or the diff is
     wrong, and one of them must change before merge.
9. **Present the result, then offer a spec only where specs are in use.** Show
   the full result — the conformance report written with the template below,
   leading with the verdict and the non-conformances, the matrix — in one
   place, and wait for the user's reaction. If nobody is there to respond (an
   automated or chained run), end here with the result reported and create
   nothing optional. Offer a spec file only if the project already keeps spec
   documents (`.specs/` or its own spec tool) or the user asked for one, and
   this work has none — and offer it at most once per session: a declined
   offer is not repeated, and the work stays context-driven. If the user
   agrees, write `.specs/<slug>/spec.md` from what this pass established — the
   scope, the requirements (`R-<n>`) the diff implements, the test criteria
   (`TC-*`) that prove them, and the contract shapes the diff follows — with
   `Status: Draft` and the standard spec sections (context, scope, non-scope,
   interface and data contracts, behaviour, error and edge cases, test
   criteria, observability, rollback plan, open questions). Only a human
   approves it, later. Anything still open goes into its open questions, not
   invented. Do not edit the diff — report, do not fix.

## Writing rules

- **The matrix is the report.** The conformance matrix is the primary
  artifact — one row per `R-*`, no exceptions. Prose around it is secondary.
- **Point at lines.** "Implemented" means you can name the file and hunk. If
  you cannot point at the code, the state is Cannot verify, not Implemented.
- **Conformance is binary per requirement.** There is no "mostly
  implemented". Partial is a gap with a named missing part.
- **Contract differences are findings, not suggestions.** "The spec says
  `payment_pending`, the code says `pending_payment`" is a non-conformance
  until the spec is changed. Do not soften a contract mismatch into a nit.
- **Extra tests are good; extra behavior is not.** A test beyond the `TC-*`
  list is coverage. A behavior beyond the `R-*` list is scope creep. Tell
  the two apart.
- **This skill does not judge quality.** Clarity, complexity, and style
  belong to a quality review. If the only problems you find are quality
  problems, the conformance verdict is still Conformant — say so plainly,
  and record the quality observations under Notes so they are not lost.

## Template

```markdown
# AI Code Review: <PR>

> **Date:** <YYYY-MM-DD>
> **PR:** <link / branch>
> **Requirements:** `.specs/<slug>/spec.md` (Status: Approved) | agreed in
>   conversation (<date>) | stated intent only
> **PR scope:** <SL-* in this PR, or "all requirements">
> **Reviewer independence:** fresh context | same session as the author

## Conformance verdict

**Conformant | Conformant with gaps | Non-conformant**

<One or two sentences: what the diff implements relative to the spec.>

## Conformance matrix

| Req | State | Diff location | Notes |
|---|---|---|---|
| R-1 | Implemented | <file:lines> | <one line> |
| R-2 | Partially implemented | <file:lines> | <missing part> |
| R-3 | Not implemented | — | <what is missing> |
| R-4 | Cannot verify | — | <what would verify it> |
| R-5 | Deferred | — | <planned in SL-n / next PR> |
| R-6 | Dropped | — | <AM-n; no code expected> |

## Contract check

- Interfaces: <match / mismatch detail>
- Data: <match / mismatch detail>

## Test-criteria check

| TC | Matching test in diff | Notes |
|---|---|---|
| TC-U1 | <file:lines / missing> | <one line> |
| TC-I1 | <file:lines / missing> | <one line> |

## Scope-creep check

- <hunk implementing no R-*, classified Justified or Unspecified — or "none">

## Review comments

| # | Maps to | Location | Comment | Conformance requires |
|---|---|---|---|---|
| 1 | R-2 | <file:line> | <what is wrong> | <what would make it conform> |
| 2 | TC-I1 | — | <missing test> | <test per spec wording> |

## Notes

<Quality observations for a separate quality review, extra-coverage tests
noted, context for the human reviewer.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The diff is close enough to the spec, I'll call it conformant" | "Close enough" is how a spec stops meaning anything. The matrix states are not a gradient — Partial is a gap, and the gap is named. |
| "I'll skip requirements that are obviously implemented" | "Obviously" is the fast read again. The matrix is one row per requirement, pointed at lines. Skipping rows is how a missing requirement ships with a green verdict. |
| "The contract difference is an improvement, I'll note it as a nit" | A contract difference is a non-conformance until the spec changes. Calling it a nit lets the diff and the spec drift apart silently — the next consumer of the spec gets the wrong contract. |
| "The extra feature is useful, so it's not scope creep" | Useful or not, it was not specified, and the spec's non-scope may explicitly exclude it. Scope creep is defined by the spec, not by usefulness. The finding stands; the team can add it to the spec deliberately. |
| "There's no spec, so I'll check against the PR description" | The PR description is the author's summary of their own diff — conforming to it proves nothing. Conformance needs an independent, approved spec. Without one, this skill has no input; do a general quality review instead. |
| "I'll fix the non-conformance inline" | This skill reports conformance; it does not change the diff. A fix changes what is being measured. Report, and let the author fix or the spec change. |

## Red Flags

- A conformance matrix with fewer rows than the spec has `R-*` entries.
- An "Implemented" state with no file:line to point at.
- A contract mismatch labeled as a nit or a suggestion.
- Unspecified behavior approved as "useful".
- A `TC-*` with no matching test and no finding raised.
- A verdict of Conformant with Partial or Not-implemented rows in the matrix.
- Quality findings (clarity, complexity) reported as conformance findings.

## Verification

Before returning, confirm:

- [ ] The spec's Status is Approved; the diff read is the complete PR diff.
- [ ] The PR's scope was established (slices or deferrals), or all requirements were treated as in scope and the report says so.
- [ ] The conformance matrix has exactly one row per `R-*`, each in exactly one state; Deferred and Dropped rows name their pointer.
- [ ] The report records whether the reviewer ran in a fresh context.
- [ ] Every "Implemented" row points at a file and lines.
- [ ] The contract check covers both interfaces (spec §4) and data (spec §5).
- [ ] Every `TC-*` in the spec has a row in the test-criteria check.
- [ ] Every significant diff hunk was classified against a requirement (scope-creep check).
- [ ] Every comment maps to an ID (`R-*`, `NG-*`, or `TC-*`).
- [ ] The verdict follows the verdict rules and is consistent with the matrix.
- [ ] No diff was edited — the review is a report, not a fix.

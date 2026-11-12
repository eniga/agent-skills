---
name: spine-triage
description: Judges whether a story is ready to be sized and specified, and returns a Ready, Not ready, or Blocked verdict with a ranked list of gaps and who fixes each. Use when a story needs a readiness check before refinement or specification. Use when a story keeps stalling and nobody can say why.
---

# Spine Triage

## Overview

Decide whether a story is ready, and if not, list exactly what is missing.
**Triage judges; it does not repair.** The output is a verdict and a ranked
gap list, never a rewritten story.

## When to Use

- A story exists and the next step is sizing or specification.
- A story is stuck in review and the reason is unclear.

**Not for:** a story that does not exist yet (write it first); fixing the
gaps (fix them, then triage again).

## Inputs

| Input | Where | If missing |
|---|---|---|
| The story | `.specs/<slug>/story.md`, a ticket, pasted text | Stop. The verdict is "story missing". |
| Acceptance criteria and non-goals | inside the story | Proceed. Their absence is the finding. |
| Repository context | the codebase | Proceed. The checklist stands without it. |

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

1. **Read the story** in full.
2. **Run the checklist.** Record pass, fail, or n/a for every row, with a
   one-line reason.

   | # | Check | Passes when |
   |---|---|---|
   | 1 | Single outcome | One independently shippable change. |
   | 2 | User story complete | Role, capability, and outcome are specific. |
   | 3 | Criteria exist | At least one acceptance criterion. |
   | 4 | Criteria testable | Each is Given/When/Then with concrete values. |
   | 5 | Failure and misuse covered | A criterion covers a likely failure, and the denied case when auth, money, or personal data is involved. |
   | 6 | Non-goals present | At least one plausible non-goal. |
   | 7 | No implementation | No stack, endpoints, or data models outside Context. |
   | 8 | Context sufficient | A spec author can name the systems touched and the constraints. |
   | 9 | Questions bounded | Each open question has an owner or a default. |
   | 10 | Size plausible | Fits one iteration, or is explicitly split. |

3. **Rank the gaps** by what they block: criteria first, then scope and
   non-goals, then context, then size.
4. **Decide the verdict:**
   - **Ready:** every applicable check passes.
   - **Not ready:** a check fails and the team can fix it.
   - **Blocked:** a gap needs someone outside the team. Name the person and
     what is needed.
5. **Write the verdict** using Output. In a story file, keep one `## Triage`
   section: replace its body and move the old verdict line to History.
6. **Report.**

## Rules

- Change nothing in the story except its Triage section.
- Ready with a non-empty gap list is a contradiction. Recheck.
- Every gap has a fix that names who does what.
- "The developer will figure it out" is never a reason for a pass.
- Do not soften Blocked to Not ready. The named outside dependency is the
  point.

## Output

Write the section into `.specs/<slug>/story.md`, or return it in the
conversation (contract rule 8).

```markdown
## Triage

> **Verdict:** Ready | Not ready | Blocked
> **Date:** <YYYY-MM-DD>
> **Story:** S-<n>: <title>

### Gaps (ranked)
| Rank | Gap | Blocks | Fix (who does what) |
|---|---|---|---|
| 1 | <one line> | refine / spec / build | <owner: action> |

### Checklist
- [x] 1. Single outcome: <reason>
- [ ] 2. User story complete: <reason>

### Notes
<Risks, related stories, prior art. Not gaps.>

### History
- <YYYY-MM-DD>: <earlier verdict>
```

## Verification

- [ ] The verdict is exactly one of Ready, Not ready, Blocked.
- [ ] All ten checks have a result and a reason.
- [ ] Every gap has a rank, what it blocks, and a fix with an owner.
- [ ] A Blocked verdict names the outside person and the need.
- [ ] Only the Triage section changed.

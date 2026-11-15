---
name: spine-triage
description: Judges whether a story is ready to size and specify, and returns Ready, Not ready, or Blocked with ranked gaps. Use when a story needs a readiness check before refinement or specification, or keeps stalling and nobody can say why.
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

1. **Read the story** in full.
2. **Restate it.** Before the checklist, write in two or three sentences
   who it is for, what changes for them, and how anyone will know it works,
   using only the story. If you helped write the story and can start a
   subagent, have one write this from the story text alone. If the
   restatement cannot be written, or differs from the story's title or
   stated intent, that is the first gap.
3. **Run the checklist.** Record pass, fail, or n/a for every row, with a
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

4. **Rank the gaps** by what they block: a failed restatement first, then
   criteria, then scope and non-goals, then context, then size.
5. **Decide the verdict:**
   - **Ready:** every applicable check passes.
   - **Not ready:** a check fails and the team can fix it.
   - **Blocked:** a gap needs someone outside the team. Name the person and
     what is needed.
6. **Write the verdict** using Output. In a story file, keep one `## Triage`
   section: replace its body and move the old verdict line to History.
7. **Report.**

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
> **Restated by:** fresh reader | this session

### Restatement
<Who it is for, what changes for them, how anyone will know. Matches the
title and intent: yes | no, how.>

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
- [ ] A restatement came before the checklist; a failed one is gap 1.
- [ ] All ten checks have a result and a reason.
- [ ] Every gap has a rank, what it blocks, and a fix with an owner.
- [ ] A Blocked verdict names the outside person and the need.
- [ ] A Ready verdict has no failed check.
- [ ] Only the Triage section changed.

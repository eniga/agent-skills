---
name: spine-design
description: Settles a technical approach by comparing real options, including doing nothing, and records the decision and its trade-offs. Use when a change needs an architectural or technology decision, or a spec is blocked because the approach is open.
---

# Spine Design

## Overview

Decide *how* to build something before specifying *what* gets built.
**Compare at least two real options against criteria written before the
comparison.** One option with reasons it is good is not a decision.

## When to Use

- A technology, pattern, or structural choice is open.
- The choice is expensive to reverse: data model, public contract,
  dependency, deployment topology, trust boundary.
- A proposal needs review before anyone implements it.

**Not for:** an obvious, reversible approach (build it); a product question
(that is a story); documenting a system that already exists; justifying a
choice already made (record it as decided, with its real reasons).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Problem and outcome | story, request, conversation | Stop. A design needs a stated outcome. |
| Constraints | `CONSTRAINTS.md`, infrastructure, team, deadline, budget | Proceed. Record each constraint you assumed. |
| Existing system | the codebase | Proceed. Verify every integration point you depend on before deciding. |
| Non-functional needs | story, owner, SLOs | Proceed with stated numbers marked assumed. "Should scale" is not a requirement. |
| Reviewer | a person | Proceed. The status stays Proposed. |

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

1. **State the problem** in one paragraph: what must become true, for whom,
   and why the current design cannot do it. Name no technology.
2. **State the forces** with numbers where possible: load, latency,
   consistency, failure modes, security and compliance, team skill,
   operating cost, deadline.
3. **Write three to six decision criteria, before any option.** Say how each
   is judged and how much it weighs. Always include fit with the existing
   architecture and size of change. Include security and operability when
   the decision touches data, trust boundaries, or production.
4. **List at least two real options.** One must be the cheap one: do nothing,
   keep the current design, or reuse what already exists here. State each
   option's strongest argument as its supporter would.
5. **Evaluate every option against every criterion.** Give evidence: a
   benchmark, a documented limit, a similar system, a prototype. Mark every
   judgement that rests on assumption. If a critical one does, stop: list
   the spike (question, how to answer it, time box) under Open questions
   and do not choose until it is answered.
6. **Choose.** Name the option and the criteria that decided it. When options
   tie, pick the one that changes less and reuses more. State what you give
   up.
7. **State the consequences:** new operating burden, new dependencies, new
   failure modes, new attack surface, what this rules out later.
8. **Define the reversal:** what observation would prove this wrong, what
   reversing costs, and what would lower that cost now.
9. **Report** for review. Do not write the spec and do not implement.

## Rules

- Criteria come first. Criteria written after the options only justify the
  favourite.
- A straw man is not an option. If you cannot argue for it, you have not
  understood it.
- "What we give up" is never "none".
- Non-functional requirements are numbers, never adjectives.
- A prototype answers one named question. It is not the decision.
- The status stays Proposed until someone other than the author accepts it.

## Output

Save it where the project already keeps designs: `.specs/<slug>/design.md`,
or `docs/decisions/AD-<n>-<slug>.md` for a repository-wide decision. If
neither folder exists, return it in the conversation and create no folder
(contract rule 8).

```markdown
# AD-<n>: <the choice made>

> **Date:** <YYYY-MM-DD>
> **Status:** Proposed | Accepted | Superseded by AD-<n>
> **Deciders:** <names>
> **Scope:** this feature | this service | repository-wide

## Problem
<What must become true, for whom, and why today's design cannot. No technology.>

## Forces
- **<Force>:** <number where possible>
- **Assumed:** <anything taken on faith>

## Decision criteria
| # | Criterion | How it is judged | Weight |
|---|---|---|---|

## Options
### A: <name>
<What it is. Its strongest argument.>
### B: <do nothing / keep current / reuse existing>
<Always present.>

## Evaluation
| Criterion | A | B |
|---|---|---|
| <1> | <finding + evidence> | <finding (assumed)> |

## Decision
**<Option>**, because <deciding criteria>.
**What we give up:** <specific costs>

## Consequences
- **Operations:** <what must be run and watched>
- **Team:** <what must be learned or maintained>
- **Failure modes and attack surface:** <what can now go wrong>
- **Rules out:** <what becomes harder later>

## Reversal
- **Wrong if we observe:** <metric, limit, or cost>
- **Cost to reverse:** low | medium | high, because <why>
- **Lowering it now:** <flag, staged rollout, interface> or "accepted as one-way"

## Open questions
| # | Question | Owner | Blocks the spec? |
|---|---|---|---|
```

## Verification

- [ ] The problem names no solution or technology.
- [ ] Criteria were written before the options, each with how it is judged.
- [ ] At least two real options, including the cheap one.
- [ ] Every evaluation cell marks evidence or assumption.
- [ ] "What we give up" is specific.
- [ ] Consequences and the reversal condition and cost are stated.
- [ ] Open questions have owners. The status is Proposed until accepted.

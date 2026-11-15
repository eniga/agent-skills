---
name: spine-story
description: Turns a feature idea into a tracker-ready story with testable acceptance criteria and non-goals. Use when a feature exists only as an idea, a voice note, or a product request, or a story is too vague to size or specify.
---

# Spine Story

## Overview

Turn an intent into a story a team can work from: one user story, testable
`AC-<n>` acceptance criteria, and explicit `NG-<n>` non-goals. **One story,
one outcome, no implementation.** The output is markdown; this skill never
writes to a tracker.

## When to Use

- A feature exists only as a sentence, a voice note, or a request.
- A story is too vague to size or specify.

**Not for:** a story that only needs a readiness check (judge it, do not
rewrite it); a bug with a known reproduction (record the defect instead);
several shippable features in one request (split first, write the first).

## Inputs

| Input | Where | If missing |
|---|---|---|
| Feature intent | the request, a ticket, a note | Stop. Ask what outcome is wanted and for whom. |
| Repository context | the codebase | Proceed. Any claim about existing behavior is an open question. |
| Story conventions | the tracker or `.specs/` | Proceed with the template below. |

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

1. **Restate the intent** in one sentence: "X for Y so that Z". Correct it
   with the user before going on.
2. **Choose the slug:** kebab-case, for example `payment-retries`. Confirm it.
   It is chosen once and never renamed.
3. **Ask the blocking questions,** at most five, each with a recommended
   answer: who the user is, what done looks like, what happens on failure,
   who must **not** be able to do this, and what sensitive data it touches.
   Everything non-blocking becomes an open question in the story.
4. **Write the story** using Output. Use the tracker's key as the ID, or the
   next unused `S-<n>`.
5. **Run the readiness check** below. Fix what the answers allow. List the
   rest under Open questions with an owner.
6. **Report.** Do not size, specify, or plan.

Readiness check:

| # | Check | Passes when |
|---|---|---|
| 1 | One outcome | The story ships one independently useful change. |
| 2 | User and value | It names who benefits and how. |
| 3 | Testable criteria | Every `AC-<n>` is Given/When/Then with concrete values. |
| 4 | Failure path | At least one `AC-<n>` covers invalid input, timeout, or empty state. |
| 5 | Misuse path | If it touches auth, permissions, money, or personal data, an `AC-<n>` covers the denied case. |
| 6 | Non-goals | At least one `NG-<n>` a reader would otherwise assume is in scope. |
| 7 | No solution | No stack, endpoints, data models, or file paths outside Context. |

## Rules

- Acceptance criteria use concrete values, never "works correctly",
  "appropriate", or "etc.".
- Write the criteria before anyone knows the implementation. Criteria written
  after the code only describe the code.
- A non-goal must be something a reader would plausibly assume is included.
- Implementation ideas and file citations go under Context, never in the
  story, criteria, or non-goals. When a non-goal rests on a code fact, cite
  it in Context (contract rule 2) and keep the non-goal in user terms.
- Two shippable outcomes are two stories. Say so and write the first.

## Output

Save to `.specs/<slug>/story.md`, or return it in the conversation (contract
rule 8).

```markdown
# Story: <one-line title>

> **Slug:** <slug>
> **Story ID:** <tracker key or S-<n>>
> **Status:** Draft
> **Source:** <issue link, meeting, request>

## User story
As a <role>, I want <capability>, so that <outcome>.

## Acceptance criteria

### AC-1: <name>
- **Given** <concrete context>
- **When** <concrete action>
- **Then** <observable result>

## Non-goals
- **NG-1:** <what is out of scope, and why it is easy to assume it is in,
  in user terms; no file names or code>

## Open questions
- <question> | owner: <name> | blocks: yes/no | recommended: <default>

## Context
<Systems touched, sensitive data involved, known constraints, prior art.>
```

## Verification

- [ ] The restated intent and the slug were confirmed by the user.
- [ ] The story has a role, a capability, and an outcome.
- [ ] Every `AC-<n>` is Given/When/Then with concrete values.
- [ ] A failure path is covered, and a misuse path where check 5 applies.
- [ ] At least one real `NG-<n>` exists.
- [ ] No implementation detail appears outside Context.
- [ ] Every open question has an owner.

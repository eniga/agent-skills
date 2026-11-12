---
name: spine-story
description: Turns a feature intent into a tracker-ready story with one outcome, Given/When/Then acceptance criteria including failure and misuse paths, and explicit non-goals. Use when a feature exists only as an idea, a voice note, or a product request. Use when a story is too vague to size or specify.
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
| 7 | No solution | No stack, endpoints, or data models outside Context. |

## Rules

- Acceptance criteria use concrete values, never "works correctly",
  "appropriate", or "etc.".
- Write the criteria before anyone knows the implementation. Criteria written
  after the code only describe the code.
- A non-goal must be something a reader would plausibly assume is included.
- Implementation ideas go under Context as notes, never as requirements.
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
- **NG-1:** <what is out of scope, and why it is easy to assume it is in>

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

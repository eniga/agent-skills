---
name: spine-spec
description: Writes a complete specification on a fixed template (contracts, numbered requirements, error and security cases, test criteria, observability, rollback) and holds it at Draft until a human approves. Use when a ready story or request needs a written spec. Use when requirements exist but interfaces, data contracts, error handling, or test criteria are undefined.
---

# Spine Spec

## Overview

Fix what will be built before any code is written: interfaces, data,
behavior, failure modes, security, and the test criteria that prove each
one. **Every section is present, every `R-<n>` has a `TC-*`, and only a
human approves.**

## When to Use

- A ready story exists and the project keeps specs, or the user asked for
  one.
- Requirements exist but contracts, error handling, or test criteria do not.
- The change spans modules or takes more than a day.

**Not for:** a one-file fix with clear requirements (put the criteria in the
commit); changing an approved spec (that is a recorded amendment); a project
that keeps no specs when nobody asked for one.

## Inputs

| Input | Where | If missing |
|---|---|---|
| Outcome with `AC-*` and `NG-*` | story file, ticket, conversation | Restate what exists as `AC-*` and `NG-*`, marked context-sourced. Stop only if no outcome is stated anywhere. |
| Sketch and tasks | `.specs/<slug>/sketch.md`, `tasks.md` | Proceed. They are a head start only. |
| Quality bar `C-*` | `CONSTRAINTS.md` | Proceed. Use the repository's existing test and lint setup and say so. |
| Existing contracts | code, API schemas, migrations | Proceed. Every contract you did not verify is an open question with an owner. |
| Human approver | a person | Stop before marking Approved. |

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

1. **Read** the story, the sketch, `CONSTRAINTS.md`, and the code the change
   touches. Read the existing contracts in full: callers depend on them.
2. **List your assumptions** (platform, auth model, data store, scale,
   compatibility) and ask the user to correct them.
3. **Write the spec** on the template in Output, `Status: Draft`. Number each
   behavior `R-<n>` and name the `AC-<n>` it serves, or mark it `derived`.
   Keep any `R-<n>` IDs from a sketch; mark dropped ones
   `R-<n> (dropped: reason)`; continue the numbering for new ones.
4. **Specify the change as a delta.** Extend existing interfaces and data
   compatibly: add optional fields, keep existing responses and errors. Any
   breaking change is called out with every consumer it affects.
5. **Cover the bad paths.** For each interface: invalid input, timeout,
   duplicate, no permission, empty data, partial failure. Each gets an
   `R-<n>`.
6. **Derive test criteria.** Each `R-<n>` gets at least one `TC-U<n>` (unit),
   `TC-I<n>` (integration), or `TC-E<n>` (end to end). Each `TC-*` states
   setup, action, and expected result, and cites the `R-<n>` it proves.
7. **Check against `CONSTRAINTS.md`.** A conflict is an open question. Never
   lower the bar silently.
8. **Review gate.** Present the spec section by section. Apply corrections.
   Set `Status: Approved` with approver and date only on an explicit yes.
9. **Report.** A Draft spec is not something to build on.

## Rules

- One `R-<n>` is one behavior a reader can verify. "Handles errors" is not a
  requirement.
- Contracts show real shapes: fields with types, named states and
  transitions, columns and indexes.
- An empty section says "none" and why. It is never omitted.
- Observability names events, metrics, and alerts. "Add logging" is not
  enough.
- Rollback names a mechanism, a trigger, and what happens to data the new
  version wrote.
- IDs are addresses. Never renumber or reuse them.
- "Go ahead" said before the spec existed is not approval.

## Output

Save to `.specs/<slug>/spec.md`, or in the project's own spec format.

```markdown
# Spec: <feature>

> **Status:** Draft | Approved
> **Approved by:** <name> | **Date:** <YYYY-MM-DD>
> **Story:** S-<n>: <title> | **Slug:** <slug>

## 1. Context
<What exists today, the problem, who is affected, the C-<n> rules that apply.>

## 2. Scope
<Three to seven bullets. Each maps to at least one R-<n>.>

## 3. Non-scope
- **NG-1:** <from the story, verbatim>

## 4. Interface contracts
### <Interface>
- **Change:** new | compatible extension | breaking (consumers: <list>)
- **Request:** <fields with types>
- **Response:** <fields with types>
- **Errors:** <code and shape per failure>
- **Authorization:** <who may call it>
- **Example:** <one concrete request and response>

## 5. Data contracts
<Stores, fields with types, constraints, indexes, states and transitions,
migration up and down, data classification.>

## 6. Behaviour
- **R-1** (from AC-1): <one verifiable behavior>

## 7. Error and edge cases
- **R-4** (derived): <failure mode and required behavior>

## 8. Security and privacy
- **Trust boundaries:** <where untrusted input enters and how it is validated>
- **Access:** <authentication, authorization, least privilege>
- **Data:** <sensitive fields, storage, retention, what must never be logged>
- **Abuse cases:** <misuse and the R-<n> that prevents each>

## 9. Test criteria
### Unit (TC-U)
- **TC-U1** (proves R-1): <setup, action, expected result>
### Integration (TC-I)
- **TC-I1** (proves R-2): <components, expected result>
### End to end (TC-E)
- **TC-E1** (proves R-1, R-3): <user flow, what is observed>

## 10. Observability
- **Logs:** <event, level, fields>
- **Metrics:** <name, type, labels>
- **Alerts:** <condition, severity, who is paged>

## 11. Rollback plan
- **Mechanism:** <flag / migration down / deploy revert>
- **Trigger:** <alert or metric>
- **Data consequences:** <what happens to data the new version wrote>
- **Steps:** <numbered, executable>

## 12. Open questions
- <question> | owner: <name> | recommended: <default>
```

## Verification

- [ ] All twelve sections are present; empty ones say "none" with a reason.
- [ ] Every `AC-*` is served by an `R-*`; every `R-*` has a `TC-*`; every
      `TC-*` cites its `R-*`.
- [ ] Contracts show concrete shapes, and breaking changes list consumers.
- [ ] Each interface covers the six bad paths in step 5.
- [ ] Security names trust boundaries, access, data, and abuse cases.
- [ ] Observability and rollback are specific.
- [ ] The status is Approved only with a named human approver and a date.
- [ ] No implementation was started.

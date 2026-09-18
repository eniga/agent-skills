---
name: spec
description: Writes the full specification for a feature on a fixed template and gates it on human review before any implementation starts. Use when a story is ready and nothing has been specified yet. Use when requirements exist but interfaces, data contracts, error handling, or test criteria are undefined.
---

# Spec

## Overview

Define what to build, completely, before any code is written. The spec is the
contract between the team and the implementation: it fixes the interfaces,
the data, the behavior, the failure modes, and the test criteria. Nothing is
built until a human has reviewed and approved it.

The spec is written to a **fixed template** — every section is present, even
when the answer is "none". An empty section with a reason is information; a
missing section is a hole.

## When to Use

- A story (`.specs/<slug>/story.md`) is triaged Ready and needs specifying.
- Requirements exist in chat or a doc but interfaces, data contracts, error
  handling, or test criteria are undefined.
- A change touches more than one module, or would take more than a day to
  build.

**When NOT to use:** The change is a single-file fix with unambiguous
requirements (write the acceptance criteria in the commit message instead).
The spec already exists and needs updating (edit it — the spec is a living
document; update it before the code, not after). You are specifying a
technical design with open product decisions (settle those first, or record
them as open questions with owners).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| A story with `AC-*` and `NG-*` | `.specs/<slug>/story.md` | Stop. Write the outcome, the user, and the acceptance criteria first, even as a paragraph. A spec with no stated outcome specifies nothing. |
| Refinement sketch and tasks (`T-*`) | `.specs/<slug>/sketch.md`, `tasks.md` | Proceed. These are a head start, never a prerequisite. |
| Quality bar (`C-*`) | `CONSTRAINTS.md` at repo root | Proceed. Set test-criteria expectations from the repository's existing configuration and note that no written bar existed. |
| Existing contracts the change touches | the codebase, API schemas, migrations | Proceed, and record every unverified contract as an open question with an owner. Guessing a contract is how integration breaks. |
| A human approver | a person | Stop before marking the spec approved. The approval gate is the point of this skill; self-approval defeats it. |

## Process

1. **Read the inputs.** Read `.specs/<slug>/story.md` (story, ACs, non-goals),
   `.specs/<slug>/sketch.md` if a refinement sketch exists, `CONSTRAINTS.md` if
   it exists,
   and the relevant existing code. If the story is missing, stop and run
   write the story first — a spec with no stated outcome specifies nothing.
2. **Surface assumptions.** Before writing, list every assumption you are
   making (platform, auth model, data store, scale, compatibility) and ask
   the user to correct them. Do not silently fill gaps — the spec's whole
   value is forcing clarity before code.
3. **Write the spec** to `.specs/<slug>/spec.md` using the fixed template
   below. Every section is present. Assign requirement IDs `R-1`, `R-2`, ...
   to every behavior the spec commits to.
4. **Derive test criteria from requirements.** For each `R-<n>`, write the
   test criteria that prove it: `TC-U<n>` (unit), `TC-I<n>` (integration),
   `TC-E<n>` (e2e). Every `TC-*` cites the `R-*` it proves. Every `R-*` has
   at least one `TC-*`. This section is the input to implementation — tests are
   written from it, not from finished code.
5. **Check the constraints.** If `CONSTRAINTS.md` exists, confirm the spec's
   test criteria and error handling satisfy its rules. Note any conflict as
   an open question — do not silently weaken the bar.
6. **Review gate.** Present the spec to the user section by section. Collect
   corrections, update the file, and repeat until the user explicitly
   approves. Set `Status: Approved` with the approver and date. **Do not
   proceed to planning or implementation until approval is explicit.**
7. **Stop.** Do not plan, do not build. The next step is deciding the build
   order against this approved spec.

## Writing rules

- **Requirements are numbered and atomic.** One `R-<n>` = one behavior a
  reader can verify. "The system handles errors" is not a requirement;
  "R-4: when the payment provider times out, the order is marked
  `payment_pending` and a retry is scheduled" is.
- **Contracts are concrete.** Interface and data contracts show real shapes:
  request/response fields with types, state machines with named states and
  transitions, storage with columns and indexes. "An API endpoint" is not a
  contract.
- **Error and edge cases are a first-class section.** For every interface:
  what happens on invalid input, timeout, duplicate, no permission, empty
  data, and partial failure. Each gets an `R-<n>`.
- **Non-scope comes from the story.** Copy every `NG-*` from the story into
  the non-scope section. Add any the spec process revealed.
- **Observability is specific.** Name the logs (event, level, fields),
  metrics (name, type, labels), and alerts (condition, severity). "Add
  logging" is not observability.
- **Rollback is a plan, not a hope.** Name the mechanism (flag, migration
  down, deploy revert), the trigger (which alert or metric), and the data
  consequences (what happens to data written by the new version).
- **The spec is a living document.** When a decision changes during
  implementation, update the spec first, then the code. Commit the spec with
  the code.

## Fixed template

```markdown
# Spec: <feature name>

> **Status:** Draft | Approved
> **Approved by:** <name>
> **Date:** <YYYY-MM-DD>
> **Story:** S-<n> — <title> (`.specs/<slug>/story.md`)
> **Slug:** <slug>

## 1. Context

<What exists today, what problem this solves, who is affected, and the
constraints from CONSTRAINTS.md that apply. Link prior art.>

## 2. Scope

<What this spec covers, in 3-7 bullets. Each bullet maps to at least one R-<n>.>

## 3. Non-scope

- **NG-1:** <from the story, verbatim>
- **NG-2:** <...>
- <any non-goal the spec process revealed, with a one-line reason>

## 4. Interface contracts

<Every public interface this feature adds or changes. For each: name,
request/response or signature with field types, error responses, and an
example.>

### <Interface 1>
- **Request:** <fields with types>
- **Response:** <fields with types>
- **Errors:** <code/shape per failure mode>
- **Example:** <one concrete request/response pair>

## 5. Data contracts

<Every data structure added or changed: storage location, fields with types,
constraints, indexes, state machines (states + transitions), and migration
direction (up and down).>

## 6. Behaviour

<Numbered requirements. Each R-<n> is one atomic, verifiable behavior.>

- **R-1:** <behavior>
- **R-2:** <behavior>
- **R-3:** <behavior>

## 7. Error and edge cases

<For every interface and data path: invalid input, timeout, duplicate, no
permission, empty data, partial failure. Each gets an R-<n>.>

- **R-4:** <failure mode and required behavior>
- **R-5:** <...>

## 8. Test criteria

<Derived from requirements. Every TC cites the R it proves. Every R has at
least one TC. build writes tests from this section — not from finished code.>

### Unit (TC-U)
- **TC-U1** (proves R-1): <what is set up, what is called, what is asserted>
- **TC-U2** (proves R-4): <...>

### Integration (TC-I)
- **TC-I1** (proves R-2): <components involved, what is asserted>

### E2E (TC-E)
- **TC-E1** (proves R-1, R-3): <user flow, what is observed>

## 9. Observability

- **Logs:** <event name, level, fields, when emitted>
- **Metrics:** <name, type (counter/gauge/histogram), labels, what it measures>
- **Alerts:** <condition, severity, who is paged>

## 10. Rollback plan

- **Mechanism:** <flag / migration down / deploy revert>
- **Trigger:** <which alert or metric starts the rollback>
- **Data consequences:** <what happens to data written by the new version>
- **Steps:** <numbered, executable>

## 11. Open questions

- <question, owner, recommended default>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is simple, I don't need a spec" | Simple changes don't need long specs, but they still need the error and test sections. A two-requirement spec takes five minutes and catches the one edge case you would have shipped. |
| "I'll write the tests after the code, I know what to test" | Tests written after the code assert what the code does, bugs included. The test criteria section is the only place where "what should happen" is fixed before "what does happen" exists. |
| "The error section is overkill for an internal endpoint" | Internal endpoints fail too — the caller just can't see why. "Timeout returns 504 and the operation is idempotent" is one line and saves a postmortem. |
| "Observability can be added when we ship" | Observability added after shipping is added after the first incident, when you are tired and the context is gone. Naming the three metrics now costs a paragraph. |
| "Rollback is just 'revert the deploy'" | "Revert the deploy" is not a plan when the new version wrote new data. The data-consequences line is the part that separates a plan from a hope. |
| "The user said go, so the spec is approved" | Approval is explicit. "Go" was said before the spec existed. Present the spec, get the yes, then build. |
| "I'll skip the non-scope section, it's in the story" | The spec is read by people who did not read the story. Copying the non-goals costs nothing and stops the spec from being read as a blank check. |

## Red Flags

- A section of the template is missing rather than present with "none".
- An `R-<n>` with no `TC-*` proving it.
- A `TC-*` that does not cite an `R-*`.
- Interface contracts with no error responses.
- "Add logging" or "add metrics" without names, levels, or conditions.
- A rollback plan with no data-consequences line.
- Status: Approved with no approver or date.
- Implementation starting before the review gate passed.

## Verification

Before returning, confirm:

- [ ] `.specs/<slug>/spec.md` exists and contains all 11 template sections.
- [ ] Every section is present; empty sections say "none" with a reason.
- [ ] Every behavior has an `R-<n>`; every `R-<n>` has at least one `TC-*`.
- [ ] Every `TC-*` cites the `R-*` it proves and is split into unit / integration / e2e.
- [ ] Interface and data contracts show concrete shapes, not descriptions.
- [ ] Error and edge cases cover invalid input, timeout, duplicate, no permission, empty data, and partial failure for each interface.
- [ ] Observability names specific logs, metrics, and alerts.
- [ ] The rollback plan has a mechanism, a trigger, data consequences, and steps.
- [ ] Non-scope includes every `NG-*` from the story.
- [ ] The user explicitly approved the spec; Status, approver, and date are filled in.
- [ ] No implementation has started.

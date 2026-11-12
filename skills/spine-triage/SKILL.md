---
name: story-triage
description: Judges whether a Jira story is ready for refinement and specification, returning a ready or not-ready verdict with a ranked gap list. Use when a story needs a readiness check before refinement or specification. Use when a story keeps stalling in review and you need to know why.
---

# Story Triage

## Overview

Decide whether a story is ready to be refined and specified, and if not, list
exactly what is missing. The output is a verdict plus a ranked gap list — not
a rewrite. Triage diagnoses; it does not treat.

## When to Use

- A story exists (in `.specs/<slug>/story.md` or pasted in) and the next
  step is refinement or specification.
- A story has been sitting in review and nobody can say why it is blocked.
- You inherited a story and need to know what you are getting into.

**When NOT to use:** The story does not exist yet (write it first — there is
nothing to judge). The story is ready and you want to fix its gaps (fix them,
or rewrite the story; this skill judges, it does not repair). The story is
ready and you want to move on (size and break down the work instead).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The story to judge | `.specs/<slug>/story.md`, a ticket, or pasted text | Stop. There is nothing to triage. |
| Acceptance criteria (`AC-*`) and non-goals (`NG-*`) | inside the story | Proceed — their absence is the finding. A story with no testable criteria is Not ready, and that is the verdict. |
| Repository context | the codebase | Proceed. Context sharpens the feasibility gaps but the readiness checklist stands without it. |

This skill needs a story. Nothing else.

**Where output goes.** Spec documents are optional. Write the `## Triage`
section into `.specs/<slug>/story.md` only when the project already keeps spec
documents (a `.specs/` directory, or its own spec tool's format — then use
that format) or the user asks for files. Otherwise return the verdict in the
conversation: the IDs it assigns are still used, marked context-sourced, and
carried into whatever tracker or conversation holds the story.

## Process

1. **Locate the story.** Read `.specs/<slug>/story.md` if it exists, or the
   story the user pasted or linked; if neither exists, stop and say the
   story is missing — that is the verdict.
2. **Run the readiness checklist** below. For each check, record pass, fail,
   or n/a with a one-line reason.
3. **Rank the gaps.** Order failures by how much they block downstream work:
   missing or untestable acceptance criteria first, then unclear scope or
   non-goals, then missing context (data, contracts, dependencies), then
   sizing risk.
4. **Write the verdict** using the template below, and return it in chat.
   When the story lives in a file (see Where output goes), put it under a
   single `## Triage` heading. If a Triage section already exists from an
   earlier run, replace its body with the new verdict and move the old
   verdict line into a `### History` list (date, verdict) at the end of the
   section — one current verdict, never two.
5. **Present the result, then offer a spec only where specs are in use.** Show
   the full result — the verdict, the ranked gaps, the checklist — in one
   place, and wait for the user's reaction. If nobody is there to respond (an
   automated or chained run), end here with the result reported and create
   nothing optional. Offer a spec file only if the project already keeps spec
   documents (`.specs/` or its own spec tool) or the user asked for one, and
   this work has none and the verdict is Ready — and offer it at most once per
   session: a declined offer is not repeated, and the work stays
   context-driven. If the user agrees, write `.specs/<slug>/spec.md` from what
   this pass established — the scope, and the requirements (`R-<n>`) and test
   criteria (`TC-*`) the acceptance criteria imply — with `Status: Draft` and
   the standard spec sections (context, scope, non-scope, interface and data
   contracts, behaviour, error and edge cases, test criteria, observability,
   rollback plan, open questions). Only a human approves it, later. Anything
   still open goes into its open questions, not invented. Do not fix the gaps,
   do not refine, do not spec — the verdict tells the next person what to do.

## Readiness checklist

A story is **Ready** only when every applicable check passes.

| # | Check | Passes when |
|---|---|---|
| 1 | Single outcome | One story, one outcome. Two shippable outcomes = fail. |
| 2 | User story complete | Role, capability, and outcome are all present and specific. |
| 3 | ACs exist | At least one acceptance criterion. |
| 4 | ACs are testable | Every AC is Given/When/Then with concrete values; no "etc.", "appropriate", "as needed". |
| 5 | Failure paths covered | At least one AC covers a likely failure (invalid input, timeout, no permission, empty state). |
| 6 | Non-goals present | At least one `NG-*` that is a plausible scope assumption. |
| 7 | No implementation leakage | No tech stack, endpoints, or data models in the story body (Context section excepted). |
| 8 | Context sufficient | A spec author can identify the systems touched and the key constraints from the story alone. |
| 9 | Open questions bounded | Open questions are listed, each with a recommended default or an owner. |
| 10 | Sizing plausible | The story is small enough to spec and build in one iteration, or it is explicitly split. |

## Verdict rules

- **Ready** — all applicable checks pass. The gap list is empty or contains
  only n/a entries.
- **Not ready** — one or more checks fail. Every failure becomes a gap with a
  rank, a one-line description, and the fix (who does what: "add AC for
  expired-card path", "split into two stories", "name the data owner").
- **Blocked** — a gap cannot be fixed without input from someone outside the
  team (product decision, another team's contract). Say who and what is
  needed.

## Template

```markdown
## Triage

> **Verdict:** Ready | Not ready | Blocked
> **Date:** <YYYY-MM-DD>
> **Story:** S-<n> — <title>

### Gaps (ranked)

| Rank | Gap | Blocks | Fix |
|---|---|---|---|
| 1 | <one-line description> | <refine / spec / build> | <who does what> |
| 2 | <...> | <...> | <...> |

### Checklist

- [x] 1. Single outcome — <reason>
- [ ] 2. User story complete — <reason>
- ...

### Notes

<Anything a refiner should know that is not a gap: known risks, related
stories, prior art.>

### History

- <YYYY-MM-DD> — <earlier verdict> (only when re-triaged)
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's close enough, I'll mark it ready and fix the gaps during refinement" | Refinement assumes a stable contract. Gaps found during refinement are rework: the sketch and tasks get redone. Triage is the cheap place to find them. |
| "I'll just fix the gaps myself while I'm here" | Triage is a diagnosis, not a treatment. Fixing gaps changes the story, which changes what you just triaged. Fix, then re-triage. |
| "The ACs are vague but the developer will figure it out" | "The developer will figure it out" is how two developers build two different features. Untestable ACs produce untestable specs. |
| "Sizing is the refiner's job" | Sizing risk is a readiness signal. A story that is ten stories wearing a trench coat fails triage so it gets split before anyone spends time sketching it. |
| "Blocked is too strong, I'll say not ready" | "Not ready" implies the team can fix it. "Blocked" names the external dependency and the person who must act. The distinction is the point. |

## Red Flags

- A verdict of Ready with a non-empty gap list.
- Gaps without a Fix column — a gap nobody can act on is a complaint.
- The triage rewrote the story instead of judging it.
- "Developer will figure it out" appearing as a reason for a passing check.
- A Blocked verdict with no named owner or dependency.
- Triage appended to a story that does not exist (the verdict should be "story missing").

## Verification

Before returning, confirm:

- [ ] The verdict is exactly one of Ready, Not ready, or Blocked.
- [ ] Every checklist row has pass/fail/n/a and a one-line reason.
- [ ] Every gap has a rank, a description, what it blocks, and a fix.
- [ ] Gaps are ordered by downstream impact (ACs first, then scope, then context, then sizing).
- [ ] The verdict was returned in chat and, when the story is a file, recorded under one `## Triage` section (earlier verdicts moved to History, not duplicated).
- [ ] No story content was changed — only the Triage section was added or updated.

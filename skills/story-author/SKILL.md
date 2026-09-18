---
name: story-author
description: Turns a feature intent into a Jira-ready story with Given/When/Then acceptance criteria and explicit non-goals. Use when starting a new feature from a vague idea, a voice note, or a product request. Use when a story needs to be written before refinement or specification.
---

# Story Author

## Overview

Turn a feature intent into a story a team can actually work from: one user
story, testable Given/When/Then acceptance criteria, and explicit non-goals.
The output is a markdown file the team pastes into Jira — this skill never
writes to Jira itself.

## When to Use

- A feature exists only as a sentence, a voice note, or a product request.
- A story in the tracker is too vague to refine or spec.
- You are about to run `/refine` or `/spec` and there is no story yet.

**When NOT to use:** The story already exists and just needs a readiness
check (use `story-triage`). The work is a bug fix with a known reproduction
(no story needed — go straight to `spec` or `build`). The request bundles
several independently shippable features (split it into multiple stories
first; one story, one outcome).

## Process

1. **Capture the intent.** Read the raw request. Restate it in one sentence
   back to the user: "So the feature is X for Y so that Z." If the restatement
   is wrong, fix it before anything else.
2. **Choose the slug.** Pick a kebab-case slug for the feature (e.g.
   `payment-retries`). It names the `.specs/<slug>/` directory every later
   stage writes into. Confirm it with the user; it is chosen once and never
   renamed.
3. **Ask blocking questions.** Identify what you cannot infer: who the user
   is, what "done" looks like, which platforms/roles are in play, what
   happens on failure. Ask at most 5 questions, each with your recommended
   answer. Record non-blocking unknowns as open questions in the story
   instead of asking.
4. **Write the story** using the template below. Save it to
   `.specs/<slug>/story.md` in the current repository.
5. **Self-triage once.** Run the `story-triage` checklist mentally against
   what you just wrote. Fix gaps you can fix from the answers you already
   have; list the rest under Open questions.
6. **Return the story** in chat with the file path, and stop. Do not refine,
   spec, or plan.

## Writing rules

- **One story, one outcome.** If the intent contains two things that could
  ship separately, say so and write the first story only.
- **ACs are testable.** Every acceptance criterion is Given/When/Then with
  concrete values, not adjectives. "Given a card with an expired expiry, when
  the user submits, then the form shows an inline error and nothing is
  charged" — not "the form validates the card."
- **ACs cover the failure paths.** For each happy path, write at least one
  criterion for the most likely failure (invalid input, timeout, no
  permission, empty state).
- **Non-goals are real.** Each `NG-*` is something a reader would plausibly
  assume is in scope. "No mobile app support" is a non-goal; "we will not
  build a time machine" is noise.
- **No implementation in the story.** No tech stack, no API shapes, no data
  models. Those belong in the spec. If you know the implementation, note it
  under Open questions as context, not as a requirement.

## Template

```markdown
# Story: <one-line title>

> **Slug:** <slug>
> **Story ID:** S-1
> **Status:** Draft
> **Source:** <where the intent came from — issue link, meeting, request>

## User story
As a <role>,
I want <capability>,
so that <outcome>.

## Acceptance criteria

### AC-1: <name>
- **Given** <concrete context>
- **When** <concrete action>
- **Then** <observable result>

### AC-2: <name>
- **Given** <concrete context>
- **When** <concrete action>
- **Then** <observable result>

## Non-goals

- **NG-1:** <what is explicitly out of scope, and why it is easy to assume it is in>
- **NG-2:** <...>

## Open questions

- <unresolved question, with the recommended default if you have one>

## Context

<Anything a spec author needs that is not a requirement: existing systems
touched, known constraints, links to prior art.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The intent is clear enough, I'll skip the questions" | Clear to you, not to the next reader. The questions exist to surface the assumptions you are silently making. Five questions now beats a re-spec later. |
| "I'll write the ACs after I know the implementation" | ACs are the contract the implementation must satisfy. Writing them after the code means they just describe what the code does, bugs included. |
| "Non-goals are negative and add nothing" | Non-goals are how scope creep gets caught. Every `NG-*` is a future "can we also..." that already has its answer. |
| "I'll put the tech stack in the story so the spec is faster" | The story is the *what*; the spec is the *how*. Baking implementation in locks the spec into your first guess and makes the story unreviewable by product. |
| "One big story is fine, we'll split it during refinement" | Refinement splits tasks, not stories. If two outcomes could ship separately, they are two stories, and the second one is invisible until you name it. |
| "I'll write it straight into Jira" | The markdown file is the source of truth and the input to `/refine` and `/spec`. Jira is a copy destination, not a workflow. |

## Red Flags

- An AC that contains "etc.", "appropriate", "reasonable", or "as needed".
- A story with happy-path ACs and no failure-path ACs.
- Non-goals that are jokes or that nobody would assume are in scope.
- Implementation details (frameworks, endpoints, table names) in the story body.
- Two independently shippable outcomes in one story.
- The slug was not confirmed, or later stages use a different slug.

## Verification

Before returning, confirm:

- [ ] `.specs/<slug>/story.md` exists and matches the template.
- [ ] The user story has a role, a capability, and an outcome.
- [ ] Every AC is Given/When/Then with concrete values; at least one AC covers a failure path.
- [ ] Every NG is a plausible scope assumption, not filler.
- [ ] No implementation details appear outside the Context section.
- [ ] Open questions are listed with recommended defaults where you have them.
- [ ] The slug was confirmed with the user.

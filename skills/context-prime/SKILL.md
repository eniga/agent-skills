---
name: context-prime
description: Builds a verified map of how a repository actually works before any work is planned against it, separating what was read in the code from what was inferred. Use when starting work in an unfamiliar codebase. Use when a story, spec, or plan would otherwise rest on assumptions about existing behavior. Use when onboarding to a project or picking up a system nobody remembers.
---

# Context Prime

## Overview

Prime yourself on a repository before deciding anything against it: what it
does, how it is structured, where the work will land, and what will get in
the way. Every fact carries a citation to the file that proves it, and every
inference is labelled as an inference.

The defining rule: **a fact cites a file, or it is an assumption.** Agents and
new engineers fail the same way in unfamiliar code — they pattern-match a
framework they recognise, describe the system they expect, and specify work
against a codebase that does not exist. This skill exists to make that
failure visible before it is expensive.

## When to Use

- Starting work in a codebase you have not verified yourself.
- A story, spec, plan, or estimate would otherwise rest on guesses about how
  the system currently behaves.
- Onboarding to a project, or picking up a system nobody on the team
  remembers building.
- An agent session is beginning work in a repository with no written
  orientation.
- Estimates keep being wrong in one area and nobody can say why.

**When NOT to use:** You already know the area and can cite the files (write
the work down; do not survey what you can already prove). The question is
narrow and answerable directly ("where is the retry configured?" — go read
it). You want prescriptive architecture documentation of a system you are
designing (this skill describes what exists, not what should). The repository
already has a current, verified map (read it; re-verify only what your work
touches).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The repository | the working directory | Stop. There is nothing to map. |
| The purpose — what the map is for | the story, task, or request | Proceed with a general orientation, but say so. A map with no destination surveys everything shallowly and answers nothing; a purpose tells you what to go deep on. |
| Existing documentation | `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `CLAUDE.md`, ADRs | Proceed. Their absence is normal, and their presence is a claim to verify against the code, not a source to copy. |
| A way to run the project | test and build commands | Proceed, but a map built without running anything is entirely inference. Running the tests is the cheapest verification available. |

## Process

1. **Name the purpose.** One sentence: what decision this map has to support.
   "Add OAuth to the existing login flow" produces a different map from
   "estimate a payments migration". Everything below is scoped by this.
2. **Establish the shape.** Read what is cheap and load-bearing before
   reading code: the manifest and its dependencies, the build and test
   configuration, the entry points, the top-level directory layout, and the
   CI workflow. Record the language, framework, versions, and how the thing
   is run and tested.
3. **Trace one real path end to end.** Pick the flow closest to your purpose
   and follow it through the actual code: entry point → routing → handler →
   business logic → data access → response. Name the file at each hop. One
   traced path teaches more about the real conventions than a directory
   listing of everything, because it shows how the layers actually talk.
4. **Map the data.** Where state lives: schema, models, migrations, caches,
   queues, external stores. Note what owns each piece of data and what else
   reads it. Data ownership is where most unexpected coupling turns up.
5. **Find the seams.** The boundaries your work will cross: external APIs,
   authentication and authorization, feature flags, background jobs,
   configuration and secrets, error handling and observability. For each, cite
   where it is set up and how existing code uses it.
6. **Learn the conventions by reading, not assuming.** How this repository
   does things, with an example of each: test structure and naming, error
   handling, logging, dependency injection, module boundaries, naming style.
   Cite one real example per convention — a convention you cannot point at is
   a preference you brought with you.
7. **Run something.** Run the test suite, or start the application. Record
   the command, whether it worked, and how long it took. This converts a pile
   of inferences into verified facts, and a suite that does not run is itself
   the most important fact on the map.
8. **Record the hazards.** What will make work here harder than it looks:
   missing or slow tests, generated code, a framework version past end of
   life, circular dependencies, a module everything imports, commented-out
   code that looks live, TODOs that mark real traps, areas with no clear
   owner.
9. **Separate fact from inference, explicitly.** Go back through what you
   wrote. Anything you did not read directly is an inference — label it, and
   say what would confirm it. **This step is the skill.** Everything before it
   is reading; this is what makes the map safe to build on.
10. **Write the map and stop.** Do not design, specify, or fix anything you
    found. Record hazards as hazards; acting on them is separate work with
    its own gates.

## Templates

Context map, saved to `.specs/context.md`, or `.specs/<slug>/context.md` when
scoped to one piece of work:

```markdown
# Context map: <repository or area>

> **Date:** <YYYY-MM-DD>
> **Purpose:** <the decision this map supports>
> **Scope:** <what was surveyed — and what was deliberately not>
> **Verified by running:** <command — result, duration> (or: nothing was run)

## Shape

- **Language / runtime:** <x> (`<file cited>`)
- **Framework:** <x> version <n> (`<file>`)
- **Entry points:** `<path>` — <what starts here>
- **Build / test / run:** `<commands>` (`<file>`)
- **CI:** <what runs on a PR> (`<file>`)

## Facts

Each fact cites the file that proves it.

| # | Fact | Evidence |
|---|---|---|
| CX-1 | <what is true about this system> | `<path:line>` |
| CX-2 | <what is true> | `<path:line>` |

## Traced path: <the flow>

1. `<path:line>` — <what happens>
2. `<path:line>` — <what happens>
3. `<path:line>` — <what happens>

## Data

| Store | What it owns | Defined in | Also read by |
|---|---|---|---|
| <table / collection / cache> | <data> | `<path>` | `<path>` |

## Seams

| Boundary | Where it is set up | How existing code uses it |
|---|---|---|
| <auth / flags / jobs / external API> | `<path>` | `<path>` — <pattern> |

## Conventions

| Convention | Example |
|---|---|
| <how tests are structured> | `<path>` |
| <how errors are handled> | `<path>` |

## Hazards

| # | Hazard | Why it will cost you | Evidence |
|---|---|---|---|
| 1 | <e.g. no tests around the billing module> | <consequence for work here> | `<path>` |

## Inferences — NOT verified

| # | Inference | Why I believe it | What would confirm it |
|---|---|---|---|
| 1 | <assumed behavior> | <the pattern that suggested it> | <the file to read or command to run> |

## Not surveyed

<Areas deliberately left unmapped, and why. A map that claims full coverage
of a large repository is claiming too much.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I recognise this framework, I know how it works" | You know how the framework works. You do not know what this team did to it — the middleware they added, the convention they abandoned halfway, the wrapper around the ORM. Recognition is the most reliable source of confident errors in unfamiliar code. |
| "I read the README, I have the context" | The README states intentions, often from a year ago. The code states behavior, today. Where they disagree the code wins, and the disagreement is itself a fact worth recording. |
| "Mapping first is slow, I'll learn as I go" | Learning as you go means discovering the constraint after you have specified around it. The map is not overhead you pay once; it is the estimate, the spec, and the plan all becoming trustworthy. An hour here routinely saves a re-spec. |
| "I'll note the assumptions later" | Later, you will not be able to tell which lines you read and which you inferred — they feel identical in memory. The separation is only cheap while you still remember, which is now. |
| "The tests don't run, but that's an environment thing" | Maybe. It is also the single most important fact about working in this repository, because it means nothing downstream can be proven. Record it as a hazard, not as a footnote. |
| "I'll fix the hazards while I'm in here" | A survey that edits is no longer a survey, and a fix made without a specification or a test is the kind of change that shows up in an incident report. Record them; fix them deliberately. |
| "I'll map the whole repository properly" | An exhaustive map of a large repository is stale before it is finished and answers no question in particular. Map what your purpose needs, deeply, and say what you did not survey. |
| "There's no spec, so I can't say what's expected" | Existing behavior is a fact you can verify by reading and running, regardless of whether anyone wrote it down. That is exactly what this map is for. |

## Red Flags

- Facts with no file citation.
- A description that matches the framework's documentation rather than this
  repository.
- No inferences listed — nobody reads a codebase and infers nothing.
- Nothing was run.
- The map covers every directory equally and answers no specific question.
- Hazards section empty in a repository older than a few months.
- Files edited during the survey.
- Version numbers, commands, or paths stated without a source.

## Verification

- [ ] The purpose is stated, and the map's depth follows it.
- [ ] Language, framework, versions, entry points, and build/test commands each cite a file.
- [ ] At least one real path is traced end to end, naming the file at each hop.
- [ ] Data stores are mapped with their owners and their other readers.
- [ ] Each convention is backed by a concrete example in this repository.
- [ ] Something was actually run, with the command and result recorded — or the failure to run is recorded as a hazard.
- [ ] Every fact cites a file; everything else appears under Inferences.
- [ ] Each inference names what would confirm it.
- [ ] Hazards are recorded with their consequence, not just their existence.
- [ ] What was not surveyed is stated.
- [ ] No files were changed and no hazards were fixed during the survey.

# Template: product requirements (`docs/PRD.md`)

Owns **what the project does and for whom, and what it deliberately does not
do**. It is the only document in the set that is allowed to state intent; every
other document explains how that intent is realized.

This is where invention does the most damage. Users, priorities, and success
measures come from a person or from existing artifacts (issues, a product
brief, a spec). What the code cannot answer is written as an open question with
an owner — never filled in with a plausible guess.

```markdown
# Product requirements

> **Doc:** PD-3
> **Status:** Draft | Current | Stale | Superseded by PD-<n>
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<entry points>`, `<routes or commands>`, `<data model>`, <product sources: issues, briefs, interviews>

## Problem

<The problem this project exists to solve, in the words of the people who have
it. Two or three paragraphs at most. Cite the source: an issue, a brief, an
interview, or name the person who stated it.>

## Users

| User | What they need | Evidence |
|---|---|---|
| <role> | <job to be done> | <file, issue, or "stated by <name> on <date>"> |

## Capabilities

What the project does today, grouped by capability. Each row points at the code
or documentation that implements it, so a reader can tell a claimed capability
from a built one.

| Capability | What it does | State | Where it lives |
|---|---|---|---|
| <capability> | <behavior in one line> | Shipped / Partial / Planned | `<path>` or PD-<n> |

## Non-goals

| # | Not doing | Why | Revisit if |
|---|---|---|---|
| NG-1 | <thing a reasonable reader would expect> | <reason> | <the trigger that would change this> |

A non-goal with no reason is a TODO in disguise. Every capability a reader
would reasonably assume and that the project does not provide belongs here.

## Success measures

| # | Measure | Current | Target | How it is measured |
|---|---|---|---|---|
| 1 | <e.g. p95 request latency> | <measured value, with date> | <target> | <command, dashboard, or query> |

If nothing is instrumented, write "not measured" and name what would have to
exist — a number with no measurement behind it is a wish.

## Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| 1 | <question only the product owner can answer> | <name or role> | <which document or decision> |
```

## Evidence rules

- Every user and every success measure traces to a person, an issue, or a
  document — not to the code's directory names.
- Capabilities are described by observed behavior that can be traced to a file,
  and their state is honest: a half-built feature is `Partial`, not `Shipped`.
- Measured values carry a date; unmeasured ones say so.
- Anything the repository cannot answer goes under **Open questions** with an
  owner — the section exists precisely so that invention is never necessary.

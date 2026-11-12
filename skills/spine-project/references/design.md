# Template: design and conventions (`docs/DESIGN.md`)

Owns **how this project builds things and why**: the conventions a contributor
must follow, the patterns that recur, and the design decisions that are already
settled, each with its rationale and what would reverse it.

It is not the system inventory — that is `docs/ARCHITECTURE.md`. It is not the
quality bar — that is `docs/CONSTRAINTS.md`. This document explains the shape a
change should take; the other two describe what exists and what must pass.

```markdown
# Design and conventions

> **Doc:** PD-5
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<src dirs>`, `<test dirs>`, `<lint/format config>`, existing decision records

## Design principles

The handful of rules that explain most of the code's shape. Three to six, each
with the tension it resolves.

| # | Principle | What it means in this codebase | Where it shows |
|---|---|---|---|
| 1 | <e.g. dependency direction points inward> | <what that forbids> | `<path>` |
| 2 | <…> | <…> | `<path>` |

A principle nobody can point at is an aspiration; either cite an example or
drop it.

## Conventions

How this repository does things, one real example each. These are the things a
new contributor would otherwise get wrong.

| Area | Convention | Example | Enforced by |
|---|---|---|---|
| Module layout | <…> | `<path>` | <linter rule / test / convention only> |
| Naming | <…> | `<path>` | <…> |
| Error handling | <…> | `<path>` | <…> |
| Logging | <…> | `<path>` | <…> |
| Dependency injection / wiring | <…> | `<path>` | <…> |
| Configuration access | <…> | `<path>` | <…> |
| Test structure | <…> | `<path>` | <…> |
| Comments and docs | <…> | `<path>` | <…> |

State plainly which conventions are machine-enforced and which rely on
reviewers. The second kind is where drift starts.

## Patterns

The recurring solutions this codebase uses, and when each applies.

### <Pattern name>

- **Use when:** <the situation>
- **Do not use when:** <the situation where it is the wrong tool>
- **Example:** `<path>` — <how it is applied>
- **Trade-off:** <what it costs>

<Repeat per pattern. Three to six real patterns; a pattern with no example is
invented.>

## Design decisions

Decisions that are already made and would be expensive or confusing to
relitigate. New decisions made for proposed work do not belong here — they
belong with the change that proposes them; this table records the ones the
system already depends on.

| ID | Decision | Status | Rationale | What would reverse it | Where it lives |
|---|---|---|---|---|---|
| AD-1 | <the choice, stated as what was chosen> | Accepted | <why, in the terms that decided it> | <the observation that would make it wrong> | `<path>` |
| AD-2 | <…> | Superseded by AD-<n> | <why it was right then> | — | `<path>` |

For a decision important enough to need its own argument — real options,
criteria, consequences — write a full record in `docs/decisions/AD-<n>-<slug>.md`
and link it from the table.

## What we explicitly do not do

| # | Practice avoided | Why | Revisit if |
|---|---|---|---|
| 1 | <e.g. no ORM; hand-written SQL> | <the reason> | <trigger> |

## Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| 1 | <…> | <name or role> | <which document or decision> |
```

## Evidence rules

- Every convention and pattern cites a real example; without one it is a
  preference, not a convention.
- Every decision names its rationale in the terms that decided it — a constraint,
  a measured limit, a deadline — not "it is best practice".
- Superseded decisions are kept and marked, never deleted: the reasoning is the
  value.
- Record only decisions the system already depends on. Proposals go with the
  change that proposes them, clearly marked as proposals.

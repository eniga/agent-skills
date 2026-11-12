# Template: delivery plan (`docs/PLAN.md`)

Owns **where the work stands and what happens next**: the current state, the
milestones with their exit criteria, the sequencing and its dependencies, and
the blockers. It is the answer to "what am I picking up".

It is not the roadmap: the roadmap records direction and bets over a longer
horizon; the plan records committed, sequenced work. It is not a task tracker —
link to the tracker instead of copying it.

```markdown
# Delivery plan

> **Doc:** PD-7
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** <issue tracker exports, milestone docs, `.specs/*`, recent history>

## Current state

<What is true right now, in a short paragraph plus a table: what is shipped,
what is half-built, what is broken. This is the paragraph a new contributor
reads to know whether the thing in front of them is finished.>

| Area | State | Evidence |
|---|---|---|
| <component or capability> | Shipped / In progress / Stalled / Not started | `<path>`, `<commit>`, or the tracker item |

## Milestones

### M-1 — <milestone name>

- **Outcome:** <what is true when this is done, observable from outside>
- **Exit criteria:** <the checks that prove it — a command, a test set, a
  capability a user can exercise>
- **Sequencing:** <what must land first, and what can run in parallel>
- **Rollback position:** <how far back you can step if it goes wrong>
- **Status:** <Not started / In progress / Done — <date>>
- **Owner:** <name or role>

<Repeat per milestone. Order them; a plan is a sequence, not a list.>

## Dependencies

| # | This work depends on | Owner | State | Risk if late |
|---|---|---|---|---|
| 1 | <another team, service, decision, or migration> | <name> | <state> | <consequence> |

## Blockers

| # | Blocked work | Blocked by | Owner | Since |
|---|---|---|---|---|
| 1 | <milestone or capability> | <the concrete obstacle> | <name> | <date> |

A blocker names a concrete obstacle and a person. "Waiting on reviews" is not a
blocker; "the auth migration in <repo> has not landed, so the client cannot be
tested" is.

## Next up

<The next one to three pieces of work in order, each with the first concrete
step. This is the section a reader actually uses; keep it current.>

1. <work> — start by <first step>
2. <work> — start by <first step>

## Out of scope for this plan

<Work a reader might expect that this plan deliberately does not cover, with a
pointer to where it is tracked instead.>
```

## Evidence rules

- Every "shipped" claim cites a path, a commit, or an issue — not an impression.
- Milestones have observable exit criteria. "Improve the API" is not a
  milestone; "the client can complete a checkout against staging" is.
- The plan reflects the actual current revision. If the state table cannot be
  reconciled with the tracker, say so rather than choosing one silently.
- Blockers name an obstacle and an owner; anything vaguer is a note.
- Do not rewrite history here: completed milestones stay, marked done, because
  they are how a reader learns what has already been tried.

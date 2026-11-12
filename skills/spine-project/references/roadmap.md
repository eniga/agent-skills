# Template: technical roadmap (`docs/ROADMAP.md`)

Owns **technical direction over a longer horizon**: what is planned now, what
is anticipated next, what is deliberately later, the drivers behind each, the
risks, and the triggers that would change the order.

It is a statement of intent, not a commitment schedule. Dates that will be read
as promises do not belong here — put them in `docs/PLAN.md`, where sequencing
and exit criteria live.

The rule that keeps this document honest: **direction comes from people, not
from TODO comments.** Anything not supplied by a maintainer or product owner is
written as an open question with an owner.

```markdown
# Technical roadmap

> **Doc:** PD-8
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** <issue tracker, design decision records, `.specs/*`, maintainer input>

## Where we are

<A short, honest account of the system's current technical position: what it is
good at, what it is straining under, what is already scheduled. Two paragraphs
at most.>

## Now — committed

Work already agreed and being executed. Each item names its driver.

| # | Item | Driver | Why now | Owner |
|---|---|---|---|---|
| 1 | <change> | <user need, scaling limit, security, cost, dependency> | <the thing forcing it> | <name> |

## Next — anticipated

Work not yet started but expected, with the condition that would pull it
forward.

| # | Item | Driver | Pull forward if | Owner |
|---|---|---|---|---|
| 1 | <change> | <driver> | <the observation or event> | <name> |

## Later — deliberate

Work that is real but explicitly deferred, with the reason it can wait.

| # | Item | Why it can wait | Revisit trigger |
|---|---|---|---|
| 1 | <change> | <reason> | <trigger> |

## Direction

The technological bets that shape Now/Next/Later, each with what it commits the
project to.

| # | Direction | Commits us to | Reversal cost |
|---|---|---|---|
| 1 | <e.g. move to a managed queue> | <the operational and code consequences> | <low / medium / high, and why> |

## Risks

| # | Risk | Likelihood | Impact | Early signal | Mitigation |
|---|---|---|---|---|---|
| 1 | <e.g. the runtime reaches end of life before the migration lands> | High/Med/Low | <what it costs> | <what to watch> | <what is being done> |

## Signals to watch

| # | Signal | Current | Threshold that triggers action | Action |
|---|---|---|---|---|
| 1 | <metric, dependency status, cost, error rate> | <measured value and date> | <the number> | <what changes> |

## Explicitly not planned

| # | Not doing | Why | Would reconsider if |
|---|---|---|---|
| 1 | <thing a reader might expect> | <reason> | <trigger> |

## Open questions

| # | Question | Owner |
|---|---|---|
| 1 | <direction nobody has decided yet> | <name or role> |
```

## Evidence rules

- Every Now/Next/Later item traces to a person, an issue, or a decision record.
  Nothing is derived from TODO comments or from the shape of the code.
- No calendar dates presented as commitments; horizon words (now, next, later)
  and conditions instead.
- "Where we are" is reconciled against the current revision — an out-of-date
  present makes the whole roadmap untrustworthy.
- Directions name their reversal cost; a bet presented as free is not examined.
- Everything undecided appears under **Open questions** with an owner rather
  than being guessed into the plan.

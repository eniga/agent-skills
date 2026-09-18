---
name: design
description: Settles a technical approach before specification by comparing real options against stated criteria and recording the decision, its trade-offs, and what would reverse it. Use when a change needs an architectural decision, a technology choice, or a system design. Use when a spec cannot be written because how to build it is still open. Use when a proposal needs review before implementation.
---

# Design

## Overview

Decide *how* to build something, before anyone specifies exactly *what* gets
built. This skill produces a design record: the problem, the forces acting on
it, the options that were genuinely considered, the chosen approach, and the
consequences — including the ones you would rather not write down.

The defining rule: **at least two real options, compared against criteria
stated before the comparison.** A design document that presents one approach
with reasons it is good is not a decision, it is an advertisement. Criteria
invented after the winner is known will always select that winner.

## When to Use

- A change needs a technology, pattern, or structural choice made.
- A spec cannot be written because the approach is still open.
- Multiple viable implementations exist and the trade-off is not obvious.
- A decision will be expensive to reverse: data model, public contract,
  dependency, deployment topology.
- A proposal needs review before anyone implements it.

**When NOT to use:** The approach is obvious and reversible (just build it —
a design record for a decision nobody would question is ceremony). The
decision is a product question, not a technical one (what to build and for
whom belongs in a story and a spec). The system is already built and you want
to document it (that is documentation of an existing system, not a decision).
The choice is already made and you want a justification written (that is not
a design; record it as a decision with its actual reasoning, however thin).

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The problem and its outcome | `.specs/<slug>/story.md`, a request, or a conversation | Stop. Designing without a stated outcome produces architecture looking for a purpose. |
| Constraints that bind the choice | `CONSTRAINTS.md`, infrastructure, team skills, deadlines, budget | Proceed, and record every constraint you assumed. An unstated constraint is the usual reason a design is rejected late. |
| The existing system | the codebase, its architecture, its data model | Proceed, but a design drawn against a guessed system is a guess. Verify the integration points you depend on before deciding. |
| Non-functional requirements (load, latency, availability, compliance) | the story, the product owner, existing SLOs | Proceed with explicit assumptions and stated numbers. "Should scale" is not a requirement; "2,000 writes/second at p99 < 200ms" is. |
| A reviewer | a person | Proceed to a proposed decision, but mark it proposed. A design nobody reviewed is a preference. |

## Process

1. **State the problem, not the solution.** One paragraph: what has to become
   true, for whom, and why the current design cannot deliver it. If the
   problem statement names a technology, you have skipped to the answer —
   rewrite it.
2. **State the forces.** What makes this hard and what bounds the answer:
   load and growth, latency budget, consistency needs, failure modes,
   security and compliance, team familiarity, operational cost, deadline,
   existing commitments. Quantify anything quantifiable; a force nobody can
   measure cannot discriminate between options.
3. **Write the decision criteria — before the options.** Three to six, each
   with how it will be judged. Weight them if they are not equal. This
   ordering is not a formality: criteria written after the options are
   reverse-engineered from the preferred answer, every time.
4. **Identify real options.** At least two that a competent engineer would
   actually defend, and include the cheap one — "do nothing", "keep the
   current design", or "the boring thing that already works here" — because
   it is often correct and is almost never written down.
   - A straw man is not an option. If you cannot state an option's strongest
     argument as its proponent would, you have not understood it well enough
     to reject it.
5. **Evaluate each option against each criterion.** Say what is true, with
   evidence where evidence exists: a benchmark, a similar system, a
   documented limit, a prototype. Mark judgements that rest on assumption
   rather than measurement — and if a critical one rests on assumption,
   consider spiking it before deciding.
6. **Choose, and say what you are giving up.** Name the option and the
   criteria that decided it. Then state the cost honestly: what the
   discarded options were better at, and what this choice makes harder,
   slower, or more expensive. **A design with no stated downside has not been
   thought through.**
7. **State the consequences.** What becomes true once this is built: new
   operational burden, new dependency and its maintenance, new failure modes,
   what the team now has to learn, what this forecloses later.
8. **Define the reversal condition.** What would have to be observed for this
   decision to be wrong, how expensive reversing it would be, and — for a
   costly reversal — what would reduce the commitment now. A decision with no
   falsifier cannot be revisited honestly, only defended.
9. **Get it reviewed, then hand off to specification.** The design settles
   the approach; the spec then fixes the behavior, contracts, and test
   criteria within it. Do not write the spec here, and do not implement —
   a design proven only by building it is expensive to disprove.

## Templates

Design record, saved to `.specs/<slug>/design.md`, or
`docs/decisions/AD-<n>-<slug>.md` for a repository-wide decision:

```markdown
# AD-<n>: <decision, stated as the choice made>

> **Date:** <YYYY-MM-DD>
> **Status:** <Proposed | Accepted | Superseded by AD-<n>>
> **Deciders:** <names>
> **Scope:** <this feature | this service | repository-wide>

## Problem

<What must become true, for whom, and why the current design cannot deliver
it. No technology named here.>

## Forces

- **<Force>:** <quantified where possible — load, latency, budget, deadline>
- **Constraints:** <C-<n> from CONSTRAINTS.md, infrastructure, team, compliance>
- **Assumed:** <anything taken on faith, explicitly flagged>

## Decision criteria

| # | Criterion | How it is judged | Weight |
|---|---|---|---|
| 1 | <e.g. write throughput at peak> | <benchmark / documented limit> | High |
| 2 | <e.g. operational burden> | <who runs it, what breaks at 3am> | Medium |

## Options

### Option A — <name>
<What it is, in two or three sentences. Its strongest argument, stated as a
proponent would.>

### Option B — <name>
<Same.>

### Option C — <do nothing / keep current design>
<Always present. Often correct.>

## Evaluation

| Criterion | Option A | Option B | Option C |
|---|---|---|---|
| <1> | <finding + evidence> | <finding> | <finding> |
| <2> | <finding> | <finding *assumed, not measured*> | <finding> |

## Decision

**<Chosen option>**, because <the criteria that decided it>.

**What we give up:** <what the discarded options were better at, and what
this choice makes harder, slower, or costlier. Not "none".>

## Consequences

- **Operationally:** <what has to be run, watched, paged on>
- **For the team:** <what has to be learned or maintained>
- **New failure modes:** <what can now break that could not before>
- **Forecloses:** <what this makes harder to do later>

## Reversal

- **Wrong if we observe:** <the falsifier — a metric, a limit, a cost>
- **Cost to reverse:** <low / medium / high, and why>
- **Reducing the commitment now:** <abstraction, flag, or staged rollout — or
  "accepted as a one-way door">

## Open questions

| # | Question | Owner | Blocks the spec? |
|---|---|---|---|
| 1 | <question> | <name> | Yes / No |
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I already know the right answer, the document is a formality" | Then it costs you ten minutes to write the alternative and say why it loses — and that paragraph is what a reviewer needs to agree with you, and what the next engineer needs to avoid relitigating it in six months. If writing the alternative changes your mind, the document just paid for itself. |
| "There's only one real option here" | There are always at least two: this, and not doing it. If the second is obviously worse, saying so takes one line. If it is not obviously worse, you needed to write it down. |
| "I'll fill in the criteria after I compare the options" | Criteria written after the comparison select the option you already preferred. That is not a decision process, it is a justification process wearing its clothes. |
| "Listing downsides makes the proposal look weak" | It makes it look examined. A reviewer's first job is finding the cost you did not mention; handing it to them buys trust and saves a review cycle. A proposal with no downsides gets read as a proposal with hidden ones. |
| "We'll benchmark it after we build it" | After you build it, the cost of learning you were wrong is the whole implementation. If a criterion is critical and unmeasured, spike it now — a day of prototype beats a month of migration. |
| "This is easy to change later if we're wrong" | Sometimes true, and then say so and move fast. But data models, public contracts, and dependencies are load-bearing within weeks. State the reversal cost explicitly instead of assuming it is low. |
| "The design is obvious from the spec" | The spec says what the system does; the design says why it is built that way rather than the three other ways. The second question is the one that gets asked later, by someone considering a change. |
| "I'll just prototype it and see" | A prototype is good evidence and a bad decision process — the first thing that works becomes the thing you defend. Prototype to answer a named question, then decide. |

## Red Flags

- One option, presented with reasons it is good.
- Criteria appearing after the options, or matching the winner suspiciously well.
- No "do nothing" or "keep the current design" option.
- A "what we give up" section reading "none" or "minimal".
- Non-functional requirements stated as adjectives — fast, scalable, robust.
- An option dismissed in a clause, with no statement of its best argument.
- No reversal condition, or "we'd just change it" with no cost named.
- The chosen technology appearing in the problem statement.
- Deciders listing only the author.

## Verification

- [ ] The problem is stated without naming a solution or a technology.
- [ ] Forces are quantified wherever quantifiable, and assumptions are flagged as assumptions.
- [ ] Decision criteria were written before the options were evaluated, with how each is judged.
- [ ] At least two real options, including the cheap or do-nothing one.
- [ ] Each rejected option's strongest argument is stated fairly.
- [ ] Every evaluation cell distinguishes measured evidence from assumption.
- [ ] The decision names the criteria that decided it.
- [ ] "What we give up" is specific and non-empty.
- [ ] Consequences cover operations, team, new failure modes, and what is foreclosed.
- [ ] A reversal condition and reversal cost are stated.
- [ ] Open questions have owners, and each says whether it blocks specification.
- [ ] Status is Proposed until a reviewer who is not the author accepts it.

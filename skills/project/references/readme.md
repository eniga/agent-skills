# Templates: front door and index

Two files, two jobs. `README.md` at the repository root is the front door for
someone who has never seen the project. `docs/README.md` is the map for someone
already inside the documentation set. Neither restates the other's content.

Write the front door first only if it must be shipped alone; otherwise write the
index last, so every row points at a document that exists.

---

## `README.md` (root) — template

```markdown
# <Project name>

> **Doc:** PD-1
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<manifest>`, `<ci config>`, `<entry point>`

<One paragraph: what this project is and what problem it solves, in plain
language, with no marketing. A reader should be able to say what it does after
reading only this.>

## Who it is for

- <user or system that depends on this>
- <what they get from it>

## Quick start

```bash
<install command>          # verified <YYYY-MM-DD>, <duration>
<configuration step>       # what must exist before the next command
<run command>              # verified: serves on http://localhost:<port>
```

## How to test

```bash
<focused test command>     # verified: <n> passed, <duration>
<full suite command>       # verified: <n> passed, <duration>
```

## Documentation

| Document | What it covers |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | How the system is built and where things live |
| [Design](docs/DESIGN.md) | Conventions, patterns, and why they were chosen |
| [Constraints](docs/CONSTRAINTS.md) | The quality bar and the commands that enforce it |
| [Product requirements](docs/PRD.md) | What it does, for whom, and what it deliberately does not do |
| [Development](docs/DEVELOPMENT.md) | Setup, configuration, running, and testing locally |
| [Deployment](docs/DEPLOYMENT.md) | Build, environments, release, and rollback |
| [Plan](docs/PLAN.md) | Current state and what is being worked on next |
| [Roadmap](docs/ROADMAP.md) | Technical direction: now, next, later |

## Status

<What works today, what does not, and what a reader should not rely on yet.
Link to docs/PLAN.md rather than repeating it.>

## License

<license — cite the LICENSE file>
```

### Rules

- Every command block was executed; the comment records the observed result.
- No section here goes deeper than a paragraph or a table row. Depth belongs in
  the owning document, and this file links to it.
- An existing `README.md` is merged, never replaced: keep its badges, history,
  and prose unless you are explicitly deleting them, and show the diff.

---

## `docs/README.md` — template

```markdown
# Documentation

> **Doc:** PD-2
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `docs/` and the repository root

<One or two sentences: what this documentation set covers and what it does
not.>

## Read in this order

1. [`../README.md`](../README.md) — what the project is and how to start it
2. [PRD](PRD.md) — what it does and for whom
3. [Architecture](ARCHITECTURE.md) — how it is built
4. [Design](DESIGN.md) — why it is built that way
5. [Development](DEVELOPMENT.md) — run and test it locally
6. [Deployment](DEPLOYMENT.md) — ship and roll it back
7. [Constraints](CONSTRAINTS.md) — the bar every change clears
8. [Plan](PLAN.md) — where the work stands
9. [Roadmap](ROADMAP.md) — where it is going

## The set

| PD | Document | Owns | Status | Owner | Last verified |
|---|---|---|---|---|---|
| PD-1 | [`../README.md`](../README.md) | Front door and quick start | <status> | <owner> | <date> @ `<commit>` |
| PD-2 | This file | The index | <status> | <owner> | <date> @ `<commit>` |
| PD-3 | [PRD.md](PRD.md) | Product requirements | <status> | <owner> | <date> @ `<commit>` |
| PD-4 | [ARCHITECTURE.md](ARCHITECTURE.md) | System shape and structure | <status> | <owner> | <date> @ `<commit>` |
| PD-5 | [DESIGN.md](DESIGN.md) | Conventions and decisions | <status> | <owner> | <date> @ `<commit>` |
| PD-6 | [CONSTRAINTS.md](CONSTRAINTS.md) | Quality bar | <status> | <owner> | <date> @ `<commit>` |
| PD-7 | [PLAN.md](PLAN.md) | Delivery plan | <status> | <owner> | <date> @ `<commit>` |
| PD-8 | [ROADMAP.md](ROADMAP.md) | Technical direction | <status> | <owner> | <date> @ `<commit>` |
| PD-9 | [DEVELOPMENT.md](DEVELOPMENT.md) | Local development and testing | <status> | <owner> | <date> @ `<commit>` |
| PD-10 | [DEPLOYMENT.md](DEPLOYMENT.md) | Build, release, rollback | <status> | <owner> | <date> @ `<commit>` |

## Not applicable

| PD | Why this project does not have it |
|---|---|
| PD-<n> | <e.g. the project ships as a library; there is no deployment target> |

## Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| 1 | <something the code cannot answer> | <name or role> | <which document> |

## Maintenance

<How this set is kept current: who refreshes it, when, and what triggers a
refresh. Name the command a reader can run to detect drift, or state that the
**Last verified** stamps are the mechanism.>
```

### Rules

- Rows describe **ownership**, not a table of contents: a reader should be able
  to tell which document to open for a given question.
- The front door is linked as `../README.md`; do not copy it into `docs/`.
- If a standard document is absent, either it appears under **Not applicable**
  with a reason, or its absence is a gap worth stating — an index that silently
  omits a document teaches the reader the set is complete when it is not.

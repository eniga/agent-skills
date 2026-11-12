# Template: architecture (`docs/ARCHITECTURE.md`)

Owns **the shape of the system as it exists**: components, the repository map,
where state lives, the boundaries the code crosses, one execution path traced
through real files, and the hazards that make work here harder than it looks.

It describes what is built, not what should be. Proposed changes belong in a
design record for the change, clearly labelled as proposals.

```markdown
# Architecture

> **Doc:** PD-4
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<manifest>`, `<entry points>`, `<src dirs>`, `<schema/migrations>`, `<ci config>`
> **Verified by running:** `<command>` — <result>, <duration> (or: nothing was run)

## System in one paragraph

<What runs, where it runs, and what it talks to. Language, runtime, framework
and versions, each with the file that declares it. One paragraph — the depth is
below.>

## Components

| Component | Responsibility | Depends on | Defined in |
|---|---|---|---|
| <service / module / package> | <what it owns, in one line> | <other components, external systems> | `<path>` |

## Repository map

| Path | What lives here | Owner |
|---|---|---|
| `<dir>/` | <responsibility — not a filename listing> | <team, role, or "unowned"> |
| `<dir>/<sub>/` | <responsibility> | <owner> |

Generated code, vendored dependencies, and directories that must not be edited
by hand are called out explicitly. "Unowned" is a legitimate and useful entry.

## Data

| Store | What it owns | Defined in | Also read by |
|---|---|---|---|
| <table / collection / cache / queue / file> | <the data and who owns writes> | `<path>` | `<path>` or <component> |

State that lives outside a store — files on disk, in-memory caches, environment
variables, third-party systems — belongs in this table too, with the same
ownership question answered.

## Seams

The boundaries work crosses. For each, where it is configured and how existing
code uses it.

| Boundary | Where it is set up | How existing code uses it |
|---|---|---|
| Authentication / authorization | `<path>` | `<path>` — <the pattern> |
| External APIs | `<path>` | `<path>` — <the client, retry, timeout policy> |
| Feature flags | `<path>` | `<path>` |
| Background jobs / queues | `<path>` | `<path>` |
| Configuration and secrets | `<path>` | `<path>` — <how values reach the code> |
| Error handling | `<path>` | `<path>` — <the convention> |
| Observability (logs, metrics, traces) | `<path>` | `<path>` |

## Traced path: <the flow>

The single most useful part of this document: one real request, command, or job
followed through the actual code.

1. `<path:line>` — <what happens here>
2. `<path:line>` — <what happens here>
3. `<path:line>` — <what happens here>
4. `<path:line>` — <where the result leaves the system>

## Conventions that shape the code

| Convention | Example | Enforced by |
|---|---|---|
| <module boundaries / layering> | `<path>` | <linter rule, test, or "convention only"> |
| <error handling> | `<path>` | <…> |
| <naming and file layout> | `<path>` | <…> |

Deeper convention and pattern detail belongs in `docs/DESIGN.md`; keep this
table to what a reader needs in order to predict where code goes.

## Hazards

| # | Hazard | Why it costs you | Evidence |
|---|---|---|---|
| 1 | <e.g. the suite does not run on a clean checkout> | <what cannot be proven until it is fixed> | `<path>` or the command and its error |

Missing or slow tests, generated code, end-of-life dependencies, circular
imports, a module everything imports, commented-out code that looks live,
TODOs that mark real traps, areas with no owner, and anything that failed when
you ran it. Recorded, never repaired here.

## Inferences — not verified

| # | Inference | Why it seems true | What would confirm it |
|---|---|---|---|
| 1 | <assumed behavior> | <the pattern that suggested it> | <the file to read or command to run> |

## Not surveyed

<Areas deliberately left out and why. A repository-wide document that claims
complete coverage of a large system is claiming too much.>
```

## Evidence rules

- Every component, path, store, and seam cites a file. A claim you cannot point
  at belongs under **Inferences**.
- The traced path names a file at every hop; it is the proof that the layering
  described above is the layering that exists.
- Versions and commands come from the manifest and CI config, not from memory.
- Hazards state a consequence, not just an existence: not "no tests here" but
  "no tests here, so a change to this module cannot be proven before merge".
- Nothing in this document was edited, fixed, or refactored on the way past it.

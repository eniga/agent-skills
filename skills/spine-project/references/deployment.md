# Template: deployment guide (`docs/DEPLOYMENT.md`)

Owns **how the project gets from a commit to running in an environment, and how
it gets back**: the build and its artifact, the environments, configuration and
secrets, the release procedure, health checks, observability, and the rollback.

The two questions this document must answer without hedging: *what do I run to
ship this?* and *how do I undo it, and how long does that take?* If the rollback
path has never been exercised, say so — that is a finding, not a footnote.

```markdown
# Deployment

> **Doc:** PD-10
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<ci/cd workflow>`, `<container or infra files>`, `<env config>`, `<deploy scripts>`
> **Verified by running:** <build command, and any deployment step that was actually run — or: not run, and why>

## What ships

| Item | Built by | Artifact | Where it goes |
|---|---|---|---|
| <service / package / static site> | `<command or CI job>` | <file, image, bundle> | <registry, host, CDN> |

```bash
<build command>            # verified <YYYY-MM-DD>: <result>, <duration>, artifact size>
```

## Environments

| Environment | Purpose | URL / endpoint | Deployed by | Data |
|---|---|---|---|---|
| Development | <purpose> | <address> | <who or what> | <real / synthetic / none> |
| Staging | <purpose> | <address> | <who or what> | <…> |
| Production | <purpose> | <address> | <who or what> | <…> |

State clearly which environments hold real user data and which are safe to
break.

## Configuration and secrets

| Name | Required | Where it is set | Set by | Rotates |
|---|---|---|---|---|
| `<VAR>` | yes / no | <secret manager, CI variable, config file> | <who> | <how often, or never> |

- **Secrets never live in the repository.** Name the store and the access path.
- **Config drift:** the differences between environments, and how they are kept
  in sync (or not).
- **Migrations:** `<command>` — <when it runs, whether it is reversible, and
  what happens if it runs twice>.

## Release procedure

1. <precondition — e.g. the change is merged, CI is green, the version is bumped>
2. `<deploy command>` — <verified: result, duration>
3. <verification step — e.g. the health check below returns healthy>
4. <announcement or record step, if any>

- **Deploy window:** <any restriction, or "any time">
- **Who can deploy:** <names, roles, or the automated path>
- **Frequency:** <how often releases happen today, from the history>

## Health checks and smoke tests

```bash
<health check>             # verified: <expected response>
<smoke test>               # verified: <expected result>
```

A deploy is not finished when the command exits zero; it is finished when these
pass against the deployed environment. State the check and the expected output.

## Observability

| Signal | Where to look | Normal range | Alert threshold |
|---|---|---|---|
| Logs | <location, query> | — | <what pages someone> |
| Errors | <dashboard> | <baseline> | <threshold> |
| Latency | <dashboard> | <baseline, with date> | <threshold> |
| Saturation (CPU, memory, queue depth) | <dashboard> | <baseline> | <threshold> |
| Business metric | <dashboard> | <baseline> | <threshold> |

Baselines are measured values with dates; a threshold with no baseline is a
guess. If a signal does not exist yet, write "not instrumented" and record it
as a hazard.

## Rollback

- **Procedure:** `<command or steps>`
- **Rehearsed:** <date, and what happened> — or: **never exercised**, which
  means the real recovery time is unknown.
- **Time to roll back:** <measured, or estimated and marked as an estimate>
- **Irreversible parts:** <migrations, data writes, sent notifications — and
  what is done instead>
- **Roll-forward option:** <when fixing forward is safer than reverting>

## Post-deploy watch

| Window | Signal | Threshold that triggers rollback | Who watches |
|---|---|---|---|
| <first 15 minutes> | <error rate, latency, queue depth> | <the number> | <name or role> |

## Related documents

- `docs/CONSTRAINTS.md` — the checks that must pass before this deploy is allowed
- `docs/DEVELOPMENT.md` — the local loop that precedes it
- `docs/PLAN.md` — what is scheduled to ship next
```

## Evidence rules

- The build command was run and its artifact and duration recorded.
- Every deployment step that was executed is marked verified with a date; steps
  taken from an existing script but never run are marked as such.
- Environment table distinguishes real data from safe-to-break environments.
- Baselines carry a date and a measurement source; absent instrumentation is
  recorded, not invented.
- The rollback section states plainly whether it has been rehearsed. "Never
  exercised" is an acceptable and important answer.
- No secret values appear anywhere in this document.

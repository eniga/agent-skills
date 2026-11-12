# Template: development guide (`docs/DEVELOPMENT.md`)

Owns **the local loop**: prerequisites, setup, configuration, how to run the
project, how to run each level of test, how to debug it, and what to try when
the obvious thing fails.

Every command in this document was executed while writing it, and the observed
result is recorded next to it. A quick start that does not work teaches the
reader that the whole documentation set is unreliable.

```markdown
# Development

> **Doc:** PD-9
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<manifest>`, `<lockfile>`, `<config samples>`, `<test config>`, `<ci workflow>`
> **Verified by running:** install, build, test, and start commands — <results and durations>

## Prerequisites

| Requirement | Version | How to check | Notes |
|---|---|---|---|
| <runtime> | <version from the manifest or CI> | `<command>` | <version manager file, if any> |
| <package manager> | <version> | `<command>` | |
| <service or tool> | <version> | `<command>` | <e.g. a database, container runtime, CLI> |

Versions come from the manifest and CI configuration, not from the machine you
happened to use.

## Setup

```bash
<clone and enter>
<install dependencies>       # verified <YYYY-MM-DD>: <result>, <duration>
<first-time setup step>      # e.g. copy the config sample, apply migrations
<build>                      # verified: <result>, <duration>
```

State what the setup step actually produced — files created, services started,
prompts expected. A step whose effect the reader cannot observe will be skipped.

## Configuration

| Variable / setting | Required | Default | What it controls | Where to get it |
|---|---|---|---|---|
| `<VAR>` | yes / no | <default or none> | <effect> | <config sample, secret store, teammate> |

The sample file in the repository is the source of truth for the names; this
table explains them. Never print a real secret value here.

## Running it

```bash
<development start command>   # verified: <where it listens / what it prints>
<production-like start>       # verified: <result>
```

- **Entry point:** `<path>` — <what starts here>
- **Local addresses:** <URLs and ports, with the file that configures them>
- **Seed data:** `<command>` — <what it creates, if anything>

## Testing

The levels that exist in this project, and the command for each. Only list
levels that actually exist; say so if one does not.

| Level | Command | Scope | Typical duration |
|---|---|---|---|
| Focused / unit | `<command>` | <what it covers> | <seconds> |
| Integration | `<command>` | <what it covers> | <seconds> |
| End to end | `<command>` | <what it covers> | <minutes> |

- **Full suite:** `<command>` — verified <YYYY-MM-DD>: <n> passed, <n> failed,
  <duration>. <If it does not pass on a clean checkout, say so here and record
  it as a hazard in `docs/ARCHITECTURE.md`.>
- **Coverage:** `<command>` — <threshold and where it is enforced, or "not
  measured">
- **Test layout:** `<path>` — <the convention: where a test for `<path>` lives,
  how it is named>
- **Adding a test:** <the short recipe, using a real existing test as the
  example>

## Debugging

| Symptom | First thing to check | Why |
|---|---|---|
| <e.g. the app exits immediately> | <command or file> | <the common cause> |
| <e.g. a request 500s> | <log location, request id> | <the common cause> |

- **Logs:** <where they go locally, and the flag that raises verbosity>
- **Breakpoints / interactive debugging:** <how to attach, if supported>
- **Common failure modes:** <environment drift, port conflicts, missing
  migrations, stale caches — with the command that clears each>

## Troubleshooting the setup

<The failures you actually hit while verifying this document, with the fix.
This section is written from experience, not from imagination — it is the most
valuable part of the document and the easiest to fake, so keep it real.>

## Related documents

- `docs/ARCHITECTURE.md` — where the code you are about to change actually is
- `docs/CONSTRAINTS.md` — the checks that must pass before a change lands
- `docs/DEPLOYMENT.md` — shipping and rolling back
```

## Evidence rules

- Every command block records an observed result and a date; a command nobody
  ran is moved to troubleshooting as "not verified".
- If the full suite does not pass on a clean checkout, that fact is stated in
  this document and recorded as a hazard in the architecture document.
- Versions cite the manifest, lockfile, or CI configuration.
- No real secret values: variable names, purpose, and source only.
- The troubleshooting section contains failures that were actually encountered.

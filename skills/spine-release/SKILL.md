---
name: spine-release
description: Proves a merged change is safe to ship and to undo, and records a go or no-go. Use when a merged change is about to be deployed, a release needs a go/no-go with evidence, or the rollback has never been run.
---

# Spine Release

## Overview

Answer two questions with evidence: **will we know if this breaks, and can
we undo it?** A rollback that was never run is not a rollback plan. This
skill checks the promised signals, rehearses the undo, sets the watch, and
records the decision.

## When to Use

- A merged change is about to deploy.
- A release needs a go/no-go someone can point at later.
- The change carries a migration, a flag, a contract change, or a
  permission change.

**Not for:** unmerged or unverified code; an incident in progress (roll back
now, analyze after); a pipeline that already performs and records these
checks; a change with no runtime effect.

## Inputs

| Input | Where | If missing |
|---|---|---|
| What is shipping | commits or version tag, against what is deployed | Stop. This needs an exact answer. |
| Test evidence for the merge commit | evidence file, PR, CI | Stop. Unproven code is not released. |
| Observability plan | spec, PR, conversation | Proceed. Record the gap and derive the minimum signal the new path emits. |
| Rollback plan | spec, PR, conversation | Write one here before going on. No undo path is a one-way door that a person must accept. |
| Deploy and rollback access | pipeline, flag system, migration tool | Proceed to a written go/no-go and hand execution to someone with access. Say which checks you did not run. |
| Quality gates `C-*` | `CONSTRAINTS.md` | Proceed. Report which CI gates passed on the merge commit. |

## Operating contract

These rules apply to every step below and override habit.

1. **Think, then act.** Before the first edit or claim, write the goal, what
   you verified, your assumptions, the smallest plan, and the check that
   proves it done.
2. **Evidence, not belief.** Back every fact with `path:line` or a command
   and its output. Label the rest assumptions. Never report a check you did
   not run.
3. **Smallest change.** Change only what the task needs, reusing existing
   code first. No drive-by refactors, renames, reformatting, dependencies, or
   speculative abstractions. Report other problems as follow-ups.
4. **Keep contracts (Liskov).** Changed code accepts the same inputs and keeps
   its outputs, errors, side effects, and callers working. Breaking a
   contract is a human decision: stop and say so.
5. **One source of truth (DRY).** Reference a rule, fact, or piece of logic;
   do not copy it. Extract only on the third real duplicate.
6. **Secure by default.** No secrets in code, logs, commits, or output.
   Treat external input as untrusted. Grant least privilege. Add a dependency
   only when needed, pinned, from a known source. Flag changes to auth,
   permissions, personal data, crypto, or CI/CD for human review.
7. **Ask, do not guess.** If a missing detail would change the result, stop
   and ask one question with a recommended answer. Never approve your own
   work at a human gate. Never run a destructive action without approval.
8. **Specs are optional.** If the project keeps specs (`.specs/<slug>/` or
   its own tool), use them. If not, use the same IDs in the conversation,
   marked *context-sourced*, and carry them into commits and the PR. Never
   create `.specs/` unasked. Requirements are *agreed* only at
   `Status: Approved` with an approver, or when the user confirmed a restated
   list.
9. **Finish by reporting.** Show the result, evidence, open items, and
   follow-ups, then stop. Do not start the next stage.

## Process

1. **Name exactly what ships:** the commit range or version, the `R-*` it
   delivers, and everything riding along. Call out migrations, flags,
   contract changes, new permissions, and changed configuration or secrets.
2. **Confirm the artifact is the tested one.** The build being deployed
   comes from the commit the evidence covers, and the security gates
   (secret scan, dependency audit, code and image scans) passed on it.
3. **Check every promised signal exists and fires.** Find each log, metric,
   and alert in the code. Emit the log and read it back. Query the metric
   and see a value. For each alert, confirm the condition, the threshold,
   and who is paged.
4. **Rehearse the rollback** in a non-production environment and time it:
   - flag: turn it off and confirm the old behavior;
   - deploy revert: deploy the previous version and confirm it serves;
   - migration: run the down migration and confirm schema and data survive.
   No non-production environment: rehearse what you can locally, and
   mark RL-6 Fail with the reason. Only a named person accepting that risk
   in writing turns it into a condition.
5. **Work out what rollback does to data.** Can the old version read what
   the new one wrote? Name anything that cannot be undone: emails sent,
   payments captured, webhooks delivered, third-party records.
6. **Define the watch before deploying:** the signals, their normal values,
   the threshold that triggers rollback, and the window.
7. **Make the call:**
   - **GO:** every check passes.
   - **GO WITH CONDITIONS:** every blocker passes; named non-blocking gaps
     each have an owner and a due date.
   - **NO-GO:** any blocker fails: no rehearsed rollback, a promised signal
     missing, an alert routed to nobody, stale or failing evidence, a
     failed security gate.
8. **Get the decision from a person, then deploy and watch.** Read the
   signals at a fixed interval for the whole window and record each
   reading. If you cannot watch, hand the watch plan to a named person and
   record the handover.
9. **Record the outcome** using Output, then report. If it was rolled back,
   record the trigger, the duration, and what happened to the data.

## Rules

- Rehearse the rollback. Reading the plan is not rehearsing it.
- An alert that exists but pages nobody fails the check.
- A blocker never becomes a condition or a follow-up.
- "Ship it and watch closely" does not replace a rollback.
- Watch thresholds are numbers set before deploy, never "keep an eye on
  it".
- "Nothing changed" during the watch is a result. Record it.
- Scale the checks to the blast radius, not to the size of the diff.
- You never decide GO alone and never deploy to production without explicit
  approval.

## Output

Save to `.specs/<slug>/evidence/release-<YYYY-MM-DD>.md`, or return it in the
conversation and the deploy ticket (contract rule 8).

```markdown
# Release: <what is shipping>

> **Date:** <YYYY-MM-DD>
> **Version / commits:** <tag or range>
> **Requirements:** R-<n>
> **Decision:** GO | GO WITH CONDITIONS | NO-GO
> **Decided by:** <name>

## Scope
<What deploys, with migrations, flags, contract, permission, and
configuration changes called out.>

## Checks
| ID | Check | Blocker | Result | Evidence |
|---|---|---|---|---|
| RL-1 | Test evidence current for the merge commit | yes | Pass | <report or CI run> |
| RL-2 | CI and security gates green on the shipped commit | yes | Pass | <link> |
| RL-3 | Promised logs emit | yes | Pass | <line seen in staging> |
| RL-4 | Promised metrics report | yes | Pass | <query and value> |
| RL-5 | Alerts: condition, threshold, route | yes | Fail | <no route> |
| RL-6 | Rollback rehearsed and timed | yes | Pass | <mechanism, duration> |
| RL-7 | Data consequences of rollback known | yes | Pass | <summary> |
| RL-8 | Watch plan with thresholds | yes | Pass | below |

## Rollback
- **Mechanism:** <flag / revert / down migration>
- **Rehearsed:** <where, when>, took <duration>
- **Trigger:** <signal and threshold>
- **Data consequences:** <what happens to new-version data>
- **Cannot be undone:** <effects, or "none">

## Watch plan
| Signal | Normal | Roll back if | Window |
|---|---|---|---|

## Outcome
- **Deployed:** <timestamp>
- **Observed:** <each signal's readings>
- **Result:** held | rolled back (<trigger, duration, data outcome>)

## Conditions and follow-ups
- <gap> | owner: <name> | due: <date>, or "none"
```

## Verification

- [ ] What ships is named exactly, and the artifact matches the tested
      commit.
- [ ] Every promised log, metric, and alert was seen working, and each
      alert has a named recipient.
- [ ] The rollback was run, not read, and its duration is recorded.
- [ ] Data consequences are stated, including what cannot be undone.
- [ ] Watch signals and thresholds were written before deploy.
- [ ] The decision names a person, and no blocker was downgraded.
- [ ] The watch window was observed and the outcome recorded.

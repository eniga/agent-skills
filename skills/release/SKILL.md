---
name: release
description: Proves a merged change is safe to ship and safe to undo by verifying that its observability and rollback plan actually exist and work, then watching named signals after deploy. Use when a change is merged and about to be deployed. Use when a release needs a go or no-go decision with evidence. Use when the rollback path has never been tested.
---

# Release

## Overview

Prove that a merged change is safe to ship **and safe to undo**, then watch it
land. A specification promises logs, metrics, alerts, and a rollback plan;
this skill is where those promises get checked against reality, before they
are needed at three in the morning.

The defining rule: **an untested rollback is not a rollback plan, it is a
hope.** The two questions this skill answers are "will we know if this breaks?"
and "can we undo it?" — and neither is answered by reading the document that
promised it.

## When to Use

- A change is merged and about to be deployed.
- A release needs a go / no-go decision that someone can point at afterwards.
- The rollback path has never actually been executed.
- A change carries a migration, a feature flag, or a contract change.
- You want the post-deploy watch defined *before* deploying, not improvised
  during an incident.

**When NOT to use:** The change is not merged or not verified (get it proven
first — a release check on unproven code measures the wrong thing). You are
mid-incident and need to roll back right now (execute the rollback; do the
analysis afterwards). The deployment is fully automated, rehearsed, and
already carries these gates (do not re-run ceremony the pipeline performs).
The change ships nothing observable — documentation, comments, internal
renames with no behavioral surface.

## Inputs

| Input | Where | If it is missing |
|---|---|---|
| The merged change | git, relative to what is currently deployed | Stop. "What is shipping?" must have an exact answer: commits, or a version tag. |
| Observability plan (logs, metrics, alerts) | `.specs/<slug>/spec.md` §Observability | Proceed, and record it as a gap: a change shipping with no defined signal cannot be watched, only guessed at. Derive the minimum signal — does the new path emit anything at all? — and say it was derived. |
| Rollback plan (mechanism, trigger, data consequences) | `.specs/<slug>/spec.md` §Rollback | Proceed only after writing one here. A release without a stated undo path is a one-way door, and that needs to be an explicit decision, not an oversight. |
| Test evidence | `.specs/<slug>/evidence/` | Stop if absent. Deploying unproven code and watching production is not a release process, it is an experiment on users. |
| Deploy and rollback access | the pipeline, the flag system, the migration tooling | Proceed to a written go/no-go, and hand the execution to whoever has access. Say clearly that the checks were verified but not executed by you. |
| Quality gates (`C-*`) | `CONSTRAINTS.md` at repo root | Proceed. Report which CI gates passed on the merge commit. |

## Process

1. **Name exactly what is shipping.** The commit range or version, the
   requirements (`R-*`) it delivers, and anything merged alongside it that
   will ride along. A release is what deploys, not what you were working on.
2. **Check the observability actually exists.** For every log, metric, and
   alert the spec promised: find it in the code, and confirm it fires. Emit
   the log line locally or in staging and read it back. Query the metric and
   see a value. For each alert, confirm the condition, the threshold, and
   **who gets paged** — an alert routed nowhere is a comment.
   - A promised signal that does not exist is a release blocker, not a
     follow-up ticket. It is the thing you will wish you had.
3. **Rehearse the rollback.** Not read it — run it, in a non-production
   environment that resembles production enough to mean something.
   - **Flag:** flip it off and confirm old behavior returns.
   - **Deploy revert:** deploy the previous version and confirm it boots and
     serves.
   - **Migration:** run the down-migration and confirm the schema and the
     data survive it.
   Record how long it took. Rollback duration is the number that matters
   during an incident, and nobody knows it until they measure it.
4. **Work out what rollback does to data.** The part that turns a rollback
   into a second incident. For data written by the new version: does the old
   version read it, ignore it, or crash on it? Are there rows the old schema
   cannot represent? Is any of it irreversible — an email sent, a payment
   captured, a webhook delivered, a third-party record created?
   - If some effects cannot be undone, say so plainly and name them. A
     partial rollback is still useful; a rollback wrongly believed to be
     total is dangerous.
5. **Define the watch, before deploying.** Write down the signals to observe,
   for how long, and the threshold at which you stop and roll back. Decide
   these while calm; the entire point is to have a number to compare against
   rather than a judgement to make under pressure.
6. **Make the go / no-go call.** Against the checks below, with evidence. Any
   blocker unresolved is a no-go. "Ship it and watch closely" is not a
   mitigation for a missing rollback — it is the absence of one.
7. **Deploy, then actually watch.** Observe the signals from step 5 for the
   stated window. Record what they did — including "nothing changed", which
   is the result you want and still evidence. Do not start other work during
   the watch window; an unwatched watch window is a waiting period.
8. **Record the outcome, and close the loop.** Write the release record. If
   you rolled back, record the trigger, the duration, and what the data did —
   that evidence is worth more than the release itself, and it feeds the
   diagnosis of what went wrong.

## Templates

Release record, saved to `.specs/<slug>/evidence/release-<date>.md`:

```markdown
# Release: <what is shipping>

> **Date:** <YYYY-MM-DD>
> **Version / commits:** <tag or range>
> **Requirements:** R-<n>, R-<m>
> **Decision:** <GO | NO-GO | GO WITH CONDITIONS>
> **Decided by:** <name>

## Scope

<What deploys, including anything riding along. Migrations, flags, and
contract changes called out explicitly.>

## Release checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| RL-1 | Test evidence current and passing | Pass | `evidence/test-<date>.md` |
| RL-2 | CI gates green on merge commit (`C-*`) | Pass | <link / output> |
| RL-3 | Promised logs emit | Pass | <log line observed in staging> |
| RL-4 | Promised metrics report | Pass | <query + value> |
| RL-5 | Alerts configured, threshold set, route confirmed | Fail | <no route — blocker> |
| RL-6 | Rollback rehearsed | Pass | <mechanism, duration> |
| RL-7 | Data consequences of rollback understood | Pass | <summary> |
| RL-8 | Watch plan defined with thresholds | Pass | <below> |

## Rollback

- **Mechanism:** <flag / revert / down-migration>
- **Rehearsed:** <where, when> — took **<duration>**
- **Trigger:** <the signal and threshold that starts a rollback>
- **Data consequences:** <what happens to data written by the new version>
- **Irreversible effects:** <emails, payments, webhooks — or "none">

## Watch plan

| Signal | Normal | Roll back if | Window |
|---|---|---|---|
| <error rate> | <baseline> | <threshold> | <duration> |
| <p99 latency> | <baseline> | <threshold> | <duration> |

## Outcome

> Filled in after the watch window.

- **Deployed:** <timestamp>
- **Observed:** <what each signal did — "unchanged" is a result>
- **Result:** <held | rolled back>
- **If rolled back:** trigger <what>, duration <how long>, data <what happened>

## Follow-ups

<Gaps accepted as conditions of the GO, each with an owner.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The rollback plan is written, that's enough" | The written plan has never encountered the actual migration, the actual flag, or the actual deploy tooling. Plans that have never been run fail in ways nobody predicted, at the exact moment when nobody has time to debug them. Run it once while it is cheap. |
| "We'll add the metrics if we see problems" | You cannot see problems without the metrics — that is what the metrics are for. Adding observability during an incident means shipping code to a system you already believe is broken. |
| "The alert exists" | Existing and firing are different. An alert with a wrong threshold, a stale route, or a paused schedule is worse than no alert, because it buys unearned confidence. Confirm the condition, the threshold, and who receives it. |
| "Rolling back is easy, it's just a revert" | Not once the new version has written data. The revert is the easy half; the question is whether the old version can read what the new one wrote. That is what makes rollbacks turn into second incidents. |
| "I'll watch it after I finish this other thing" | Then nobody is watching. The window exists because the failure modes that survive testing surface under real traffic within minutes. A watch window you are not present for is a waiting period with extra steps. |
| "It's a small change, it doesn't need a release check" | Small changes touch shared code and ship with less scrutiny, which is a well-documented way to cause a large incident. Scale the checks to the blast radius, not to the diff size. |
| "The deploy pipeline handles all this" | Some of it, probably. Name which checks it performs and mark those as covered — that is a legitimate and quick answer. What the pipeline does not check is what this skill is for. |
| "We can't roll back, but we've tested it thoroughly" | That may be the right call, and it is a decision someone must make knowingly. Record it as a one-way door with the reason, so the risk is chosen rather than discovered. |
| "Nothing happened during the watch, so there's nothing to record" | "Signals unchanged for thirty minutes at full traffic" is exactly the evidence that makes the next release's baseline meaningful. Record it. |

## Red Flags

- A rollback plan that has never been executed anywhere.
- Rollback duration unknown.
- An alert whose recipient nobody can name.
- Observability described in the spec but absent from the code.
- Data consequences of a rollback unexamined, on a change with a migration.
- Watch thresholds chosen after deploy, or expressed as "keep an eye on it".
- Deploying at the end of the day, before a weekend, or with the watch
  delegated to nobody.
- A GO decision with an unresolved blocker reclassified as a follow-up.
- The release record's Outcome section still empty a day later.

## Verification

- [ ] Exactly what is shipping is named: commits or version, and the `R-*` it delivers.
- [ ] Test evidence is current and passing for the merge commit.
- [ ] Every promised log, metric, and alert was found in the code **and observed working**.
- [ ] Each alert's condition, threshold, and route to a named recipient are confirmed.
- [ ] The rollback was rehearsed, not just read, with its duration recorded.
- [ ] Data consequences of rollback are stated, including irreversible effects or "none".
- [ ] Watch signals, baselines, thresholds, and window were written before deploy.
- [ ] The go / no-go decision is recorded with a name, and no blocker was downgraded to make it a GO.
- [ ] The watch window was actually observed, and the outcome recorded — including "unchanged".
- [ ] If rolled back: trigger, duration, and data outcome are recorded.

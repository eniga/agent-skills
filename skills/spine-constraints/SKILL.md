---
name: spine-constraints
description: Sets the project quality and security bar once in CONSTRAINTS.md, as numbered rules that each have a threshold, a checking command, and a gate (editor, pre-commit, CI, nightly). Use when a project has no written quality standards. Use when reviews keep re-arguing the same quality decisions. Use when deciding which checks run when and what blocks a merge.
---

# Spine Constraints

## Overview

Decide the bar once and make it enforceable. The output is `CONSTRAINTS.md`
at the repository root: rules `C-<n>`, each with a threshold, the command
that checks it, and the gate where it runs. **A rule without a command is a
wish.**

## When to Use

- The project has no written standards.
- The same quality argument repeats in every review.
- The stack or tooling changed and the old bar no longer fits.

**Not for:** changing one existing rule (edit that rule); a one-off exception
for a single change (record it in the PR); checking a change against the bar.

## Inputs

| Input | Where | If missing |
|---|---|---|
| Existing checks | lint, type, test, and CI config | Proceed. Mark each rule `not yet wired` with the step that wires it. |
| Written conventions | `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` | Proceed. |
| Team agreement on thresholds | a person | Proceed with values marked Proposed. Do not let them block anyone until confirmed. |

## Operating contract

These rules apply to every step below. They override habit and convenience.

1. **Think, then act.** Before the first edit or claim, write down: the goal,
   what you verified, what you are assuming, the smallest plan, and the check
   that will prove it done.
2. **Evidence, not belief.** Read the code and run the command before stating
   a fact. Cite `path:line`, or the command and its output. Label everything
   else an assumption. Never report a check you did not run.
3. **Smallest change that works.** Change only what the task needs. Search for
   existing code to reuse before writing new code. No drive-by refactors,
   renames, reformatting, new dependencies, or speculative abstractions.
   Problems outside the task are reported as follow-ups, not fixed.
4. **Keep contracts substitutable (Liskov).** Whatever you change must still
   work everywhere the old version was used: accept at least the same inputs,
   keep the same outputs, errors, and side effects, and leave callers
   unchanged. If a contract must break, stop and say so. That is a decision
   for a human, not a detail.
5. **One source of truth (DRY).** Each rule, fact, and piece of logic lives in
   one place. Reference it; do not copy it. Do not merge code that only looks
   alike: extract on the third real duplicate of the same knowledge.
6. **Secure by default.** No secrets in code, logs, commits, or output. Treat
   external input as untrusted. Grant least privilege. Add or upgrade a
   dependency only when needed, pinned, from a known source. Flag any change
   to auth, permissions, personal data, crypto, or CI/CD for human review.
7. **Ask, do not guess.** If a missing detail would change the result, stop
   and ask one question with a recommended answer. Never approve your own work
   at a human gate. Never run a destructive or irreversible action without
   explicit approval.
8. **Specs are optional.** If the project keeps spec files (`.specs/<slug>/`,
   or its own spec tool), read and write them there. If not, work in the
   conversation with the same IDs marked *context-sourced*, and carry them
   into commits and the PR. Never create `.specs/` unasked. Requirements are
   *agreed* only when a spec says `Status: Approved` with an approver, or the
   user confirmed a restated list.
9. **Finish by reporting.** Show the full result (output, evidence, open
   items, follow-ups) and stop. Do not start the next stage. If the project
   keeps spec files and this work has none, offer once to write a `Draft`
   spec.

## Process

1. **Detect what already exists.** Read `CONSTRAINTS.md`, linter and
   formatter config, CI workflows, and repository instructions. If
   `CONSTRAINTS.md` exists, propose a diff. Never rewrite it.
2. **Reuse before adding.** A rule already enforced by a tool is recorded by
   pointing at that tool's config and command. Do not restate its settings
   or set a second threshold.
3. **Ask for the bar,** one question at a time, with a recommended default:

   | Area | Question | Recommended default |
   |---|---|---|
   | Correctness | What must pass before a commit? | Build and unit tests |
   | Coverage | Is there a threshold, and on what? | Changed lines only |
   | Static analysis | Which rules are errors? | Type and lint errors block |
   | Secrets | Is secret scanning enforced? | Block in pre-commit and CI |
   | Dependencies | Audit and pinning policy? | Lockfile committed; high and critical block |
   | Code scanning | SAST, IaC, container scan? | Block on high severity in CI |
   | Pipeline | CI permissions and action pinning? | Least privilege; pinned versions |
   | Tests | Which levels block a merge? | Unit and integration |
   | Performance | Any budgets? | None until a baseline is measured |

4. **Place each check at the cheapest gate that catches it:**
   - **Editor/agent:** format and lint on every edit.
   - **Pre-commit:** type check, fast unit tests, secret scan.
   - **CI (merge gate):** full unit and integration suite, coverage,
     dependency audit, code scanning.
   - **Nightly:** end-to-end suites, benchmarks, full dependency and image
     scans.
5. **Write `CONSTRAINTS.md`** using Output.
6. **Get approval.** The bar is a team decision. The status stays Draft until
   a person approves it.
7. **Offer to wire the gates that hold without a prompt.** An agent can skip
   a written rule; it cannot skip a required check. With the user's
   approval, install from this skill's `references/`:
   - `commit-msg.sh` as `.githooks/commit-msg` (then
     `git config core.hooksPath .githooks`): behavior-changing commits must
     cite `SL-<n>`, `R-<n>`, or `D-<n>`.
   - `spine-gates.yml` as `.github/workflows/spine-gates.yml`: the same
     commit check, a secret scan, and a dependency audit, on every PR.

   On another CI system, port the three jobs and keep the pinned versions.
8. **Report.** The bar applies to new changes. Retrofitting old code is a
   separate decision.

## Rules

- Every rule is checkable. "Write clean code" is not a rule.
- Every rule has a command, or is marked `manual` with a named checker.
- Every threshold has a one-line reason.
- Every rule is `block` or `warn`. Do not set everything to block on day one.
- No performance budget without a measured baseline. Record the measuring
  command instead.
- Never present an unwired rule as an active gate.

## Output

```markdown
# Constraints

> **Status:** Draft | Approved
> **Approved by:** <name> | **Date:** <YYYY-MM-DD>
> **Applies to:** new changes from <date> (existing code: <retrofit policy>)

## Rules
| ID | Rule | Threshold | Command | Gate | Block/Warn | Reason |
|---|---|---|---|---|---|---|
| C-1 | Type check | no errors | `<command>` | pre-commit, CI | block | <one line> |
| C-2 | Coverage on changed lines | >= <n>% | `<command>` | CI | block | <one line> |
| C-3 | No secrets committed | zero findings | `<command>` | pre-commit, CI | block | <one line> |
| C-4 | Dependency audit | no high or critical | `<command>` | CI | block | <one line> |
| C-5 | Code scanning | no high severity | `<command>` | CI | block | <one line> |
| C-6 | Commits cite `SL-`, `R-`, or `D-` IDs | every behavior change | `sh .githooks/commit-msg --range <base>..HEAD` | commit-msg, CI | block | <one line> |

## Gates
- **Editor/agent (every edit):** <commands>
- **Pre-commit:** <commands>
- **CI (merge gate):** <commands; all block rules must pass>
- **Nightly:** <commands>

## Exceptions
<Where an exception is recorded, who approves it, when it expires. Default:
in the PR description, approved by a reviewer, expires at merge.>
```

## Verification

- [ ] `CONSTRAINTS.md` is at the repository root and matches the template.
- [ ] Every rule has an ID, threshold, command or named checker, gate,
      block or warn, and a reason.
- [ ] Secrets, dependencies, and code scanning each have a rule, or a
      recorded reason for having none.
- [ ] No rule duplicates a tool's config with a different threshold.
- [ ] Unwired rules are marked `not yet wired`.
- [ ] An existing file was changed by a reviewed diff, not rewritten.
- [ ] Gates were wired only with approval; otherwise the offer is reported.
- [ ] The status is Approved only with a named approver.

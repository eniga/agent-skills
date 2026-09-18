---
name: constraints
description: Sets the project quality bar once and writes it to CONSTRAINTS.md so every later stage enforces the same rules. Use when a project has no written quality standards. Use when agents or teammates keep making inconsistent quality decisions. Use when you need to decide which checks run when, and at what threshold.
---

# Constraints

## Overview

Decide the quality bar once, write it down, and make it enforceable. The
output is `CONSTRAINTS.md` at the repository root: a set of named rules
(`C-<n>`) with thresholds, the command that checks each one, and when it
runs. Every later skill (`build`, `test`, `review`) enforces these rules
instead of re-deciding them.

## When to Use

- Starting a new project or repository with no written standards.
- The same quality argument keeps happening in every review ("should we add
  a test for this?", "what's our coverage bar?").
- An agent is producing more code than anyone reads and there is no bar it
  has to clear.
- The team changed tools or stack and the old bar no longer applies.

**When NOT to use:** The project already has a `CONSTRAINTS.md` and only one
rule needs changing (edit that rule, bump its note, done). You are deciding a
one-off exception for a single change (record the exception in the PR, not in
the bar). You are reviewing code (use `review` — it enforces the bar, it does
not set it).

## Process

1. **Detect existing standards first.** Read `CONSTRAINTS.md`, lint configs
   (ESLint, Ruff, golangci-lint, etc.), CI config, and repo instructions
   (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`). If a `CONSTRAINTS.md`
   exists, propose diffs to it instead of rewriting it. Never silently
   overwrite an existing bar.
2. **Interview for the bar.** Ask the user, one question at a time, with a
   recommended default for each:
   - **Correctness:** What must pass before any commit? (build, unit tests)
   - **Coverage:** Is there a coverage threshold, and does it apply to new
     code only or the whole repo? (recommended: new/changed lines, no global
     number unless the team already has one)
   - **Static analysis:** Which linter/type-checker rules are errors vs
     warnings? Are warnings allowed to accumulate?
   - **Security:** Secrets scanning, dependency audit, input validation
     expectations?
   - **Performance:** Any latency or bundle-size budgets? (recommended: none
     until measured — see Red Flags)
   - **Style:** Formatting tool and whether it is enforced in CI?
   - **Test gates:** Which test levels block a merge? (recommended: unit +
     integration block; e2e blocks only when it changed)
3. **Place each check by cost.** For every rule, decide where it runs,
   cheapest place first:
   - **Editor/agent (always):** format on save, lint on edit — instant
     feedback, zero CI cost.
   - **Pre-commit:** fast unit tests, type check — seconds, not minutes.
   - **CI (merge gate):** full unit + integration suite, coverage on changed
     lines, security scans — the only checks that can block a merge.
   - **Nightly/scheduled:** e2e suites, performance benchmarks — too slow to
     run per commit.
4. **Write `CONSTRAINTS.md`** using the template below. Every rule gets an
   ID (`C-1`, `C-2`, ...), a threshold, the exact command, and its gate
   (editor / pre-commit / CI / nightly).
5. **Show the user the file and get approval.** The bar is a team decision,
   not an agent decision. Do not mark it approved until the user says so.
6. **Stop.** Do not start enforcing it on existing code. The bar applies to
   new changes from now on; retrofitting is a separate, explicit decision.

## Writing rules

- **Every rule is checkable.** "Write clean code" is not a rule. "No `any`
  in TypeScript outside `legacy/` (ESLint `no-explicit-any`, error)" is.
- **Every rule has a command.** If you cannot name the command that checks
  the rule, the rule is a wish. Mark it `manual` and say who checks it.
- **Thresholds have a reason.** Each threshold gets a one-line rationale so
  the next person can argue with the reason instead of the number.
- **Distinguish block from warn.** A rule either blocks (fails the gate) or
  warns (reported, not blocking). Say which.
- **No performance budgets without a baseline.** A latency budget with no
  measured baseline is a number that will be wrong. Record the baseline
  measurement command instead, and set the budget after the first
  measurement.

## Template

```markdown
# Constraints

> **Status:** Approved | Draft
> **Approved by:** <name>
> **Date:** <YYYY-MM-DD>
> **Applies to:** new changes from <date> onward (existing code: <retrofit policy>)

## Rules

| ID | Rule | Threshold | Command | Gate | Block/Warn | Rationale |
|---|---|---|---|---|---|---|
| C-1 | <e.g. TypeScript strict mode> | <e.g. no `any` outside legacy/> | `npm run typecheck` | CI | block | <one line> |
| C-2 | <e.g. unit test coverage on changed lines> | <e.g. >= 80%> | `npm test -- --coverage` | CI | block | <one line> |
| C-3 | <e.g. formatting> | <e.g. prettier default> | `npx prettier --check .` | pre-commit | block | <one line> |
| C-4 | <e.g. secrets> | <none> | `gitleaks detect` | CI | block | <one line> |
| C-5 | <e.g. dependency audit> | <no high/critical> | `npm audit` | CI | warn | <one line> |

## Gates

- **Editor/agent (always):** <commands the agent must run after every edit>
- **Pre-commit:** <commands>
- **CI (merge gate):** <commands; a merge requires all block rules to pass>
- **Nightly/scheduled:** <commands>

## Exceptions

<How to record a temporary exception: where it is written, who approves it,
when it expires. Default: in the PR description, approved by a reviewer,
expires at merge.>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll decide the bar as we go" | "As we go" means a different bar in every PR. The first review where two people disagree about coverage is the cost of not deciding now. |
| "100% coverage is the bar" | A coverage number is a floor, not a goal. 100% on day one blocks every merge; 100% on changed lines is enforceable. Pick the number the team will actually keep. |
| "Performance budgets first, measure later" | A budget without a baseline is a guess that will be wrong in both directions. Measure first, budget second. |
| "The linter config is the constraints file" | The linter config says what the tool checks. `CONSTRAINTS.md` says what the team decided, why, and where each check gates. The config changes weekly; the bar should change deliberately. |
| "Agents don't need a written bar, they know good code" | Agents optimize for the shortest path. Without a written bar, "good" is whatever gets the task done fastest. The bar is the thing that makes the agent stop and ask. |
| "I'll retrofit the bar onto existing code" | Retrofitting turns a quality decision into a migration project and blocks every other change. The bar applies to new changes; retrofit is a separate, scheduled decision. |

## Red Flags

- A rule with no command or no named human checker.
- A threshold with no rationale.
- A performance budget with no baseline measurement.
- Every rule set to block on day one (the bar becomes a wall, not a floor).
- The file was written without user approval.
- An existing `CONSTRAINTS.md` was overwritten instead of diffed.
- Rules that duplicate what a linter config already enforces, with different
  thresholds (two sources of truth).

## Verification

Before returning, confirm:

- [ ] `CONSTRAINTS.md` exists at the repository root and matches the template.
- [ ] Every rule has an ID, threshold, command (or named human), gate, and block/warn.
- [ ] Every threshold has a one-line rationale.
- [ ] Checks are placed by cost: nothing slow in the editor gate, nothing instant only in CI.
- [ ] No performance budget exists without a baseline measurement command.
- [ ] The user approved the file (Status: Approved, Approved by filled in).
- [ ] If a `CONSTRAINTS.md` already existed, the change is a diff the user reviewed, not a rewrite.

# Template: quality bar (`docs/CONSTRAINTS.md`)

Owns **what must pass before a change lands**: named rules with thresholds, the
command that checks each one, and the gate it runs at. This is the document a
reviewer and an agent both read to decide whether a change is acceptable.

Every rule is checkable and every rule names its command. A rule you cannot
check is a wish, and wishes do not gate anything.

If a `CONSTRAINTS.md` already exists at the repository root, **it is the
authoritative bar and this document is not written** — record a pointer to it
in `docs/README.md` instead of creating a second, conflicting source of truth.

```markdown
# Constraints

> **Doc:** PD-6
> **Status:** Draft | Current | Stale
> **Owner:** <name or role>
> **Last verified:** <YYYY-MM-DD> against `<commit>` on `<branch>`
> **Reads:** `<lint config>`, `<type-check config>`, `<test config>`, `<ci workflow>`, `<package manifest>`

## Rules

| ID | Rule | Threshold | Command | Gate | Block/Warn | Rationale |
|---|---|---|---|---|---|---|
| C-1 | <e.g. strict type checking> | <e.g. no untyped escapes outside `legacy/`> | `<command>` | CI | block | <one line> |
| C-2 | <e.g. test coverage on changed lines> | <e.g. >= 80%> | `<command>` | CI | block | <one line> |
| C-3 | <e.g. formatting> | <formatter defaults, no exceptions> | `<command>` | pre-commit | block | <one line> |
| C-4 | <e.g. dependency vulnerabilities> | <no high or critical> | `<command>` | CI | warn | <one line> |
| C-5 | <e.g. secrets> | <none committed> | `<command>` | CI | block | <one line> |

Every command above must be one that exists in this repository's manifest or CI
config and that was run while writing this document. A rule whose command does
not exist yet is recorded as a proposal, not as a rule.

## Gates

| Gate | Command | When | Fails the gate |
|---|---|---|---|
| Editor / agent | <command> | after every edit | <block / warn> |
| Pre-commit | <command> | before each commit | <block> |
| CI (merge) | <command> | on every change | <block> |
| Nightly / scheduled | <command> | nightly | <does not block merge> |

Place each check at the cheapest gate that can catch it. A check that takes
minutes does not belong in the editor loop; a check that takes a second does not
belong only in CI.

## Exceptions

<How a temporary exception is recorded — where it is written, who approves it,
when it expires. Default: in the change description, approved by a reviewer,
expires when that change merges.>

## Proposals

| # | Proposed rule | Threshold | Why | Who decides |
|---|---|---|---|---|
| 1 | <rule that cannot be enforced yet> | <…> | <…> | <name or role> |

<Everything the current configuration cannot check lives here rather than in the
rules table, so the bar stays honest about what it actually gates.>
```

## Evidence rules

- Every rule has an ID, a threshold, an exact command, a gate, and a
  block-or-warn verdict.
- Every threshold carries a one-line rationale, so the next person can argue
  with the reason instead of the number.
- No rule duplicates a linter config with a different number: the config is the
  mechanism, this document is the decision.
- No performance or size budget without a measured baseline and the command
  that produced it; until then it is a proposal.
- Rules apply to new changes; retrofitting the bar onto existing code is a
  separate, explicit decision, recorded with a date.

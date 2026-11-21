# Spine: agent skills for the software lifecycle

18 skills that take an AI coding agent from an unfamiliar repository and a
vague request to a tested, reviewed, traceable pull request and a release
that can be undone. Each skill is a short workflow (200 lines at most) with
inputs, numbered steps, hard rules, an output template, and exit checks.

Every skill name starts with `spine-`, so the pack does not collide with
built-in commands or other packs. The name comes from the **traceability
spine**: stable IDs (`AC-*` → `R-*` → `TC-*` → `SL-*`) that run from the
story through the spec, the tests, the commits, and the PR.

## Install, update, remove

Uses the [skills CLI](https://github.com/vercel-labs/skills).

```bash
npx skills add eniga/agent-skills --list              # browse first
npx skills add eniga/agent-skills                     # choose skills and agents
npx skills add eniga/agent-skills --all               # everything, every detected agent
npx skills add eniga/agent-skills --skill spine-build # one skill
npx skills add eniga/agent-skills -g                  # global (all projects)
npx skills add eniga/agent-skills -a claude-code -a github-copilot

npx skills update                                     # update installed skills
```

Remove only this pack (add `-g` for a global install):

```bash
npx skills remove spine-amend spine-build spine-conform spine-constraints \
  spine-context spine-design spine-diagnose spine-plan spine-pr spine-project \
  spine-refine spine-release spine-review spine-simplify spine-spec \
  spine-story spine-test spine-triage -y
```

Remove **every** installed skill, from every pack:

```bash
npx skills remove --all        # this project
npx skills remove --all -g     # global
```

| You use | Agent id | Skills land in |
|---|---|---|
| Claude Code | `claude-code` | `.claude/skills/` |
| VS Code with GitHub Copilot | `github-copilot` | `.agents/skills/` |
| Cursor, Codex, OpenCode, Zed, Gemini CLI, Cline, and others | `cursor`, `codex`, `opencode`, … | `.agents/skills/` |

In Claude Code and Codex each skill is also a slash command
(`/spine-build`). Elsewhere, ask for it by name: "use the spine-build
skill".

### Install from a local clone

Use a clone to try changes before they are published, or to install a fork.
Clone it once, then run the install from the project that will use the
skills. A project install lands in that project's directory, not the
clone's.

```bash
git clone https://github.com/eniga/agent-skills.git
cd path/to/your-project

npx skills add ../agent-skills --list                          # check the skills are found
npx skills add ../agent-skills --skill '*' -a claude-code --copy
npx skills add ../agent-skills --skill spine-build --copy      # one skill
npx skills add ../agent-skills --skill '*' -g --copy           # global (all projects)
```

Pass the path to your clone in place of `eniga/agent-skills`. Every other
flag works as above. `--copy` copies the files, so the install does not
depend on the clone staying where it is. After you pull or edit the clone,
run the same `add` command again to refresh the copy.

Without the CLI, copy the skill directories yourself. Each one is
self-contained, so copying a single skill works too:

```bash
mkdir -p .claude/skills .agents/skills
cp -R ../agent-skills/skills/spine-* .claude/skills/    # Claude Code
cp -R ../agent-skills/skills/spine-* .agents/skills/    # Copilot, Cursor, Codex, and others
```

For a global install, copy into `~/.claude/skills/` or `~/.agents/skills/`
instead.

Keep one copy of each skill. If the same skills are installed both globally
and in the project, the agent may load either one, so a local edit can
appear to have no effect. Remove the copy you are not testing first.

### Upgrading from the unprefixed names

The skills were renamed. Remove the old ones before installing:

```bash
npx skills remove ai-code-review build code-simplify constraints context-prime \
  design diagnose plan pr-prepare project refine release review spec \
  spec-amend story-author story-triage test -y
```

| Old | New | Old | New |
|---|---|---|---|
| `context-prime` | `spine-context` | `plan` | `spine-plan` |
| `project` | `spine-project` | `build` | `spine-build` |
| `story-author` | `spine-story` | `test` | `spine-test` |
| `story-triage` | `spine-triage` | `code-simplify` | `spine-simplify` |
| `refine` | `spine-refine` | `diagnose` | `spine-diagnose` |
| `design` | `spine-design` | `review` | `spine-review` |
| `spec` | `spine-spec` | `ai-code-review` | `spine-conform` |
| `constraints` | `spine-constraints` | `pr-prepare` | `spine-pr` |
| `spec-amend` | `spine-amend` | `release` | `spine-release` |

## The lifecycle

Run one skill at a time. Each one ends by showing its result and stops; you
decide when to move on.

| Stage | Skill | Give it | You get | Move on when |
|---|---|---|---|---|
| Orient | [`spine-context`](skills/spine-context) | What you are about to do | A map of `CX-*` facts that cite files, with guesses labelled | Tests were run, every fact cites a file |
| Orient | [`spine-project`](skills/spine-project) `init` / `list` / `summary` | The repository | `README.md` + `docs/` (`PD-1` … `PD-10`), a drift report, or a brief | A person accepted the set |
| Orient | [`spine-constraints`](skills/spine-constraints) | Your lint, test, scan, and CI setup | `CONSTRAINTS.md`: `C-*` rules, commands, gates | A person approved it |
| Define | [`spine-story`](skills/spine-story) | A raw intent | A story: `AC-*` criteria, `NG-*` non-goals | It has a failure path and a non-goal |
| Define | [`spine-triage`](skills/spine-triage) | The story | Ready / Not ready / Blocked, with ranked gaps | The verdict is Ready |
| Define | [`spine-refine`](skills/spine-refine) | The ready story | Draft `R-*` and pointed `T-*` tasks | Every point has a reason |
| Define | [`spine-design`](skills/spine-design) *(if the approach is open)* | The problem and its constraints | A decision record `AD-*`: options, criteria, trade-offs | Someone other than the author accepted it |
| Define | [`spine-spec`](skills/spine-spec) *(if you keep specs)* | Story, sketch, design | `spec.md`: contracts, `R-*`, security, `TC-*`, rollback | **A person approved it** |
| Build | [`spine-plan`](skills/spine-plan) *(if multi-slice)* | Agreed requirements | `SL-*` slices, each with files, checkpoint, rollback position | Every slice delivers a requirement |
| Build | [`spine-build`](skills/spine-build) | Plan and requirements | One commit per slice, tests written first, smallest diff | Checkpoints and the full suite are green |
| Prove | [`spine-test`](skills/spine-test) | The branch | Every `TC-*` as pass / fail / unverified, with command output | The verdict is Proven, or gaps are accepted |
| Prove | [`spine-review`](skills/spine-review) | The branch or PR | Findings by severity and a verdict | No open Blockers. Runs in a fresh subagent when the agent can start one |
| Prove | [`spine-conform`](skills/spine-conform) | Diff and requirements | One matrix row per requirement | Nothing is non-conformant |
| Ship | [`spine-pr`](skills/spine-pr) | Branch and evidence | A PR body with a requirement → commit → test → evidence table | The PR is open. Merging is yours |
| Ship | [`spine-release`](skills/spine-release) | The merged change | Signals checked, rollback rehearsed and timed, go/no-go | The watch window was observed |

`spine-review` asks whether the code is good and safe. `spine-conform` asks
whether it is what was agreed. They answer different questions.

### Loops that can interrupt any step

| When | Use | Then |
|---|---|---|
| Something fails, is flaky, or a bug is reported | [`spine-diagnose`](skills/spine-diagnose) | A defect record `D-*` with a proven cause and a failing regression test. Fix it with `spine-build` as its own slice, then re-run `spine-test` |
| A review returns findings | [`spine-build`](skills/spine-build) | Each finding answered: fix, contest with a citation, escalate, or decline a nit. Fixes are slices. Then `spine-review` again: settled findings stay settled, fixed ones are rechecked |
| Requirements change after they were agreed | [`spine-amend`](skills/spine-amend) | An amendment `AM-*`, re-approved, naming the slices, tests, and evidence it invalidates |
| Code works but is hard to read | [`spine-simplify`](skills/spine-simplify) | Behavior pinned by tests, then simplified one concern at a time |

### Shortest path by type of change

| Change | Path |
|---|---|
| New feature | `spine-story` → `spine-triage` → (`spine-refine`, `spine-design`, `spine-spec`) → `spine-plan` → `spine-build` → `spine-test` → `spine-review` + `spine-conform` → `spine-pr` → `spine-release` |
| Small feature, no spec files | `spine-story` → `spine-build` → `spine-test` → `spine-review` → `spine-pr` |
| Bug fix | `spine-diagnose` → `spine-build` (the `D-*` is the slice) → `spine-test` → `spine-review` → `spine-pr` |
| Requirement change mid-build | `spine-amend` → rebuild what it names → `spine-test` |
| Cleanup | `spine-simplify` → `spine-test` → `spine-review` |
| Unfamiliar codebase | `spine-context` first, then any path above |

## With or without spec files

Spec files are optional. Each skill checks for `.specs/<slug>/` (or your own
spec tool) and adapts.

| | Project keeps specs | Project keeps none |
|---|---|---|
| Requirements come from | `story.md`, `spec.md`, `plan.md` | The conversation, tickets, the code |
| Output goes to | `.specs/<slug>/` | The conversation, commit messages, the PR body |
| "Agreed" means | `Status: Approved` with an approver | You confirmed a restated list |
| IDs | Resolve to files | Same IDs, marked *context-sourced* |

No skill creates `.specs/` unless you ask. Work without spec files lasts as
long as the session; use spec files when work spans days, people, or audits.

## What every skill enforces

Every skill carries the same nine-rule
[operating contract](docs/operating-contract.md), stamped in by CI so each
skill still installs on its own:

1. **Think, then act**: goal, evidence, assumptions, smallest plan, proof.
2. **Evidence, not belief**: cite `path:line` or command output.
3. **Smallest change that works**: reuse first, no drive-by changes.
4. **Keep contracts substitutable (Liskov)**: existing callers keep working.
5. **One source of truth (DRY)**: reference, do not copy.
6. **Secure by default**: no secrets, untrusted input, least privilege,
   pinned dependencies, flagged changes to auth, data, and CI/CD.
7. **Ask, do not guess**: no self-approval, no unapproved destructive action.
8. **Specs are optional.**
9. **Finish by reporting**, then stop.

Security is part of each stage, not a stage of its own: misuse cases in the
story, a security section in the spec, scan gates in the constraints and
checkpoints, a security and supply-chain pass in review, security impact in
the PR, and gate and rollback proof before release.

## Enforce the rules outside the prompt

A model can skip a written rule, and smaller models do. Three rules are
therefore also shipped as checks, inside `spine-constraints`:

| Rule | Enforced by |
|---|---|
| Behavior-changing commits cite `SL-<n>`, `R-<n>`, or `D-<n>` | `commit-msg` hook, and the same script in CI |
| No secret in the tree or the history | gitleaks job |
| No known-vulnerable dependency | osv-scanner job |

Install them in a repository where the skills are used (`spine-constraints`
offers to do this for you):

```bash
SK=.claude/skills/spine-constraints/references   # or .agents/skills/..., or ~/... for -g
mkdir -p .githooks .github/workflows
cp "$SK/commit-msg.sh" .githooks/commit-msg && chmod +x .githooks/commit-msg
cp "$SK/spine-gates.yml" .github/workflows/spine-gates.yml
git config core.hooksPath .githooks              # once per clone
```

Then make the three `spine-gates` jobs required status checks on the default
branch. The hook is a convenience that `--no-verify` skips; the required CI
check is the gate. Exempt from the commit rule: merges, reverts, `fixup!`
commits, and the types `docs`, `chore`, `ci`, `build`, `style`, `test`.

## Traceability IDs

| ID | Meaning | Created by |
|---|---|---|
| `S-<n>`, `AC-<n>`, `NG-<n>` | Story, acceptance criterion, non-goal | `spine-story` |
| `R-<n>` | Requirement | `spine-spec` (drafted by `spine-refine`) |
| `TC-U/I/E<n>` | Test criterion: unit, integration, end to end | `spine-spec` |
| `T-<n>` | Task with points | `spine-refine` |
| `SL-<n>` | Build slice | `spine-plan` |
| `C-<n>` | Quality-bar rule | `spine-constraints` |
| `CX-<n>` | Verified fact about the repository | `spine-context`, `spine-project` |
| `AD-<n>` | Architecture decision | `spine-design` |
| `PD-<n>` | Project document | `spine-project` |
| `AM-<n>` | Amendment | `spine-amend` |
| `D-<n>` | Defect with a proven cause | `spine-diagnose` |
| `RL-<n>` | Release check | `spine-release` |

IDs are never renumbered or reused. A dropped requirement is marked
`(dropped: reason)`, not deleted.

## Using smaller or local models

The skills are written as short, numbered, imperative steps so they work on
Claude, the models in GitHub Copilot, and smaller local models. With a
smaller model:

- Run **one skill per session** and paste its inputs in, instead of relying
  on a long conversation history.
- Prefer **spec files**. They carry state between sessions that a small
  context window cannot.
- Keep slices small: one requirement per `SL-*`.
- Run `spine-review` with a **different or stronger model** in a fresh
  session. The model that wrote the code is its weakest reviewer. When the
  agent can start subagents, `spine-review`, `spine-conform`, and
  `spine-triage` hand the reading to one that never saw the conversation.
- Keep the human gates. Approval, merge, and release are never the agent's
  call.

## Benchmark

Measured with [agent-skills-evalset](https://github.com/eniga/agent-skills-evalset):
37 cases, each a real task in a fresh git repository, graded by code rather
than by a model. The checks run hidden acceptance tests, inspect the git
state and the files changed, and read the report for required fields. 28
cases exercise one skill each. 9 routing cases give a plain request and check
that the agent picks the right skill from the descriptions alone.

Claude Code, 2026-11-21, with the skills as they are in this repository.
With the skills, each case ran twice. Without them, each ran once on
2026-11-20 (routing cases do not apply).

| Model | Without the skills | With the skills |
|---|---|---|
| Claude Sonnet 5.5 | 1 of 28 cases, 53% of checks | 74 of 74 runs, 100% of checks |
| Claude Haiku 5.5 | 2 of 28 cases, 51% of checks | 72 of 74 runs, 99% of checks |

**Read the "without" column with care.** Without the skills, both models
usually reach a sound conclusion: they found the bug, flagged the broken
caller, approved the correct change. Most of their failed checks are things
the skills require and an unprompted agent has no reason to produce: a
verdict field, traceability IDs, a defect or amendment record, a findings
table. The differences in behavior, confirmed by reading the outputs, are
these. Without the skills, both models:

- wrote code from a requirement with no numbers in it instead of asking;
- fixed a bug directly, with no failing regression test first, or named the
  cause with no test to prove it;
- added "add to cart" without validating the quantity a customer types;
- edited files they were not asked to touch while writing a quality bar
  (`package.json`, `CLAUDE.md`, tests, `README.md`).

**The two failures with the skills** are both routing, on Haiku. For "add
shipping to orders" and for "nobody can read `src/report.js`, clean it up",
one run in two did the work without loading `spine-build` or
`spine-simplify`. The skill was installed but not chosen.

Three runs were first graded as failures and then regraded as passes,
because the grader was stricter than the requirement: a design that said
"Status is **Proposed**" in prose instead of a `Status:` field, a review that
wrote "TC-U1 to U3" instead of "TC-U3", and a summary that wrote
"No `docs/` set exists". The grader fixes are in the evalset, each passing
its self-test.

To reproduce, clone the evalset next to this repository, then:

```bash
node run.mjs --selftest                                  # graders only, no model
node run.mjs --agent claude --model <id> --repeat 2      # with the skills
node run.mjs --agent claude --model <id> --baseline      # without
```

## Repository

```
skills/                        the 18 skills, one directory each
docs/operating-contract.md     the shared rules, stamped into every skill
docs/skill-anatomy.md          the SKILL.md format
CONTRIBUTING.md                pack conventions and how to add a skill
.github/                       CI: validator, hook tests, real install, secret scan
```

To change or add a skill, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

# Skill anatomy

The format of every `skills/<name>/SKILL.md`. Pack-level conventions are in
`CONTRIBUTING.md`. `node .github/scripts/check-skills.mjs` enforces what is
marked **(CI)**.

## Location

```
skills/
  spine-<name>/
    SKILL.md           required
    references/        optional, one level deep
```

A per-skill install copies only `skills/<name>/`. Everything a skill needs
lives in its own directory. There is no shared runtime directory.

## Frontmatter

```yaml
---
name: spine-<name>
description: <What it does, third person>. Use when <trigger>. Use when <trigger>.
---
```

- `name`: lowercase, hyphenated, equal to the directory name, and prefixed
  `spine-` so it cannot collide with another pack **(CI, all three)**.
- `description`: what the skill does, then at least one `Use when` trigger
  **(CI)**, 1024 characters at most **(CI)**. Add `Not for …` when a
  neighbouring activity is easily confused with it. Do not summarize the
  steps: an agent may follow the summary instead of loading the skill.

The description is the only text an agent sees before deciding to load the
skill. Write it for routing.

## Sections

All eight are required, in this order, with these exact headings **(CI)**.
Headings inside code fences are template content and do not count. Every
budget below is checked **(CI)**, counting non-blank lines outside code
fences. A skill with several modes puts each mode's steps under its own
`### Mode: <name>` heading, and the step budget (at most 12) applies to each.

| Section | Contains | Budget |
|---|---|---|
| `## Overview` | What the skill does and its one defining rule in bold. | 3 to 6 lines |
| `## When to Use` | Triggers as bullets, then `**Not for:**` exclusions. | 1 to 9 lines |
| `## Inputs` | Table: input, where, **if missing**. The third column says to stop (and what to ask) or how to proceed without it. | 3 to 6 rows |
| `## Operating contract` | The shared rules. Never edited by hand (see below). | fixed |
| `## Process` | Numbered steps. Each step is one action the agent can do and check. | 6 to 12 steps |
| `## Rules` | Hard rules as short bullets: what never happens, and the common excuse each one closes. | 5 to 8 bullets |
| `## Output` | Where the result goes, then the exact template in a code fence. | as needed |
| `## Verification` | Exit checklist. Each box is checkable from evidence. | 6 to 10 boxes |

`SKILL.md` is 200 lines at most **(CI)**. Move a template longer than about
80 lines into `references/` and load it only at the step that needs it.
Name every such file with its path, `references/<file>`: each named file
must exist, and each shipped file must be named **(CI)**.

Every skill honours the same contract so any one can be used alone or in
place of a missing neighbour: it declares its inputs and what to do without
them, it changes only what its output names, and it ends by reporting.

## The Operating contract

`docs/operating-contract.md` is the single source. It is stamped under the
`## Operating contract` heading of every skill because a skill installed
alone cannot reach a shared file.

- Edit only `docs/operating-contract.md`.
- Run `node .github/scripts/check-skills.mjs --fix` to restamp every skill.
- CI fails when any skill's copy differs **(CI)**.

Skills refer to it as "contract rule N". Do not restate its rules in a
skill's own sections; add only what is specific to that skill.

## Writing rules

1. **Steps, not essays.** Imperative, one action per sentence. "Run the
   focused tests and record the command" beats "ensure tests are verified".
2. **Plain words.** No metaphors and no jokes. A smaller model follows a
   literal instruction and misreads a clever one.
3. **Say it once.** If a rule is in the contract or in an earlier section,
   do not repeat it. If deleting a line would not change what the agent
   does, delete it.
4. **Decisions as tables.** States, severities, and checklists go in tables
   with one meaning per row.
5. **Name the stop conditions.** Every place the agent must stop and ask is
   written as "stop".
6. **Templates are contracts.** Other stages read these shapes. Change them
   deliberately.
7. **Model-neutral.** Write the procedure. A workaround for one model's
   quirk belongs in an issue.

## No cross-skill references

A skill never names another skill, with or without backticks **(CI)**.
The CLI resolves no dependencies, so a reference to a skill that was not
installed points at nothing. Refer to the artifact or the activity and let
`## Inputs` handle absence:

```markdown
<!-- no -->
Run `spine-test` next.

<!-- yes -->
Full verification is separate work: focused tests, the full suite, and a
per-criterion report.
```

The lifecycle that connects the skills is documented once, in `README.md`.

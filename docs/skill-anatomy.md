# Skill Anatomy

The format specification for skills in this pack. `CONTRIBUTING.md` defines
the pack-level conventions (traceability spine, artifact home); this document
defines the per-skill file format.

## File location

Every skill lives in its own directory under `skills/`:

```
skills/
  skill-name/
    SKILL.md           # required: the skill definition
    references/        # optional: skill-specific reference docs
```

`SKILL.md` is the only required file. Skills in this pack are **self-contained**:
a per-skill install (`npx skills add eniga/agent-skills --skill skill-name`)
copies only `skills/<name>/`, so anything the skill needs must live inside its
own directory. There is deliberately no repo-root `references/` directory —
shared material is duplicated into each skill that needs it, because a
per-skill install that points at a repo-root sibling resolves to nothing.

## Frontmatter (required)

```yaml
---
name: skill-name-with-hyphens
description: Guides agents through [task/workflow]. Use when [specific trigger conditions].
---
```

Rules:

- `name`: lowercase, hyphen-separated, **must match the directory name**.
- `description`: third person, states what the skill does, then one or more
  "Use when" trigger conditions. Both *what* and *when*. Maximum 1024
  characters. Do not summarize the workflow — if the description contains
  process steps, the agent may follow the summary instead of reading the full
  skill.

The description is injected into the agent's system prompt, so it is the only
text the agent sees before deciding to load the skill. Write it for routing:
precise triggers beat clever marketing.

## Standard sections

```markdown
# Skill Title

## Overview
One or two sentences: what this skill does and why it matters.

## When to Use
- Positive triggers (task types, symptoms)
- When NOT to use (exclusions)

## Inputs
Table: what this skill reads, where it lives, and what to do when it is
absent. Every row's third column says `Stop` (with the reason) or `Proceed`
(with the fallback). This is what makes the skill independently usable.

## Process
Numbered, specific, actionable steps. "Run `npm test` and verify all tests
pass" beats "make sure the tests work".

## Templates
The exact shape of the artifact this skill produces, as a markdown template
with placeholders.

## Common Rationalizations
| Rationalization | Reality |
|---|---|
| Excuse an agent uses to skip a step | Why the excuse is wrong |

## Red Flags
Observable signs the skill is being violated.

## Verification
- [ ] Exit criteria, each checkable with evidence (test output, file written,
      command result). "Seems right" is never sufficient.
```

Equivalent headings are acceptable when they serve the same purpose clearly
(`Workflow` for `Process`, `Output shape` for `Templates`) — except for the
six that CI requires verbatim: `## Overview`, `## When to Use`,
`## Inputs`, `## Common Rationalizations`, `## Red Flags`,
`## Verification`. Headings
inside fenced code blocks are template content and are not counted.

`node .github/scripts/check-skills.mjs` enforces this, along with the
frontmatter rules and the 500-line limit below.

## Section purposes

- **Overview** — the elevator pitch. Why should an agent follow this skill?
- **When to Use** — routing. Positive triggers and negative exclusions.
- **Inputs** — independence. Names each input, where it lives, and the
  fallback when it is missing, so the skill degrades gracefully instead of
  depending on a sibling having run.
- **Process** — the heart. Steps, not facts. Every step must be something the
  agent can do and check.
- **Templates** — the contract for the artifact. Downstream skills parse these
  shapes; keep them stable.
- **Common Rationalizations** — the most distinctive feature of a well-crafted
  skill. Every skip-worthy step needs a counter-argument. Think of every time
  an agent said "I'll add tests later" or "this is simple enough to skip the
  spec" — those go here.
- **Red Flags** — observable violations, useful during review and
  self-monitoring.
- **Verification** — exit criteria with evidence requirements.

## Context efficiency

Skills load on demand: only name and description sit in context at startup;
the full `SKILL.md` loads when the agent decides the skill is relevant.

- Keep `SKILL.md` under 500 lines.
- Move reference material over ~100 lines into `references/` inside the skill
  and link to it from `SKILL.md` (one level deep, no chains).
- Keep file references one level deep.
- Prefer stating the goal over prescribing exact command forms where the goal
  alone would do.

## Writing principles

1. **Process over knowledge.** Workflows, not reference docs.
2. **Specific over general.** "Run the focused test command" beats "verify the
   tests".
3. **Evidence over assumption.** Every verification checkbox requires proof.
4. **Anti-rationalization.** Every skip-worthy step gets a rebuttal.
5. **Progressive disclosure.** `SKILL.md` is the entry point; supporting files
   load only when the workflow reaches them.
6. **Token-conscious.** If removing a section wouldn't change agent behavior,
   remove it.
7. **Model-neutral.** Write the procedure, not the workaround. A step that
   only exists because one model gets a specific call wrong belongs in an
   issue, not in a skill.

## Cross-skill references

**There are none.** A skill never names another skill.

The skills CLI installs skills individually and resolves no dependencies, so
`npx skills add <pack> --skill diagnose` gives the user exactly one directory.
Any sentence in it that says "run `build` first" points at something that may
not exist, and the agent cannot act on it.

Refer to the **artifact** or the **activity** instead, and let `## Inputs`
handle absence:

```markdown
<!-- no -->
Follow the `test` skill to prove the slice works.
Route complexity findings to `code-simplify`.
Run `spec` first.

<!-- yes -->
Hand off for verification: focused tests, then the full suite, then a
per-`TC-*` report.
Record complexity as a finding with a suggested shape; do not rewrite inline.
This skill reads the approved spec at `.specs/<slug>/spec.md`. If there is
none, stop — see Inputs.
```

This keeps the lifecycle legible (the pipeline lives in `README.md`, where a
human reads it) while keeping each `SKILL.md` independently installable. CI
fails on any backticked sibling skill name.

Never duplicate another skill's content either. If two skills genuinely need
the same reference material, each keeps its own copy inside its own
`references/` directory — duplication is the price of independence, and it is
cheaper than a broken install.

## Naming conventions

- Skill directories: `lowercase-hyphen-separated`
- Skill files: `SKILL.md` (always uppercase)
- Supporting files: `lowercase-hyphen-separated.md`
- Skill-specific references: inside the skill's own `references/` directory

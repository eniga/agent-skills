# Contributing

Spine is a pack of [agent skills](https://agentskills.io/) for the software
lifecycle. Each skill is a self-contained directory under `skills/`.

- What the skills do and how they connect: [README.md](README.md)
- The `SKILL.md` format: [docs/skill-anatomy.md](docs/skill-anatomy.md)
- The rules every skill carries:
  [docs/operating-contract.md](docs/operating-contract.md)

This file holds only what is not written there.

## Pack conventions

**Every skill is substitutable.** Each one has the same sections, declares
its inputs with a fallback for each, writes only the output it names, and
ends by reporting. Any skill must work when installed alone.

**Skills chain through artifacts, not through each other.** A skill reads
what an earlier stage wrote (a file under `.specs/<slug>/`, or the
conversation) and never names the skill that wrote it.

**One source of truth.**

| Fact | Lives in |
|---|---|
| Lifecycle, ID legend, install commands | `README.md` |
| Shared rules | `docs/operating-contract.md` (stamped into skills by `--fix`) |
| File format | `docs/skill-anatomy.md` |
| A skill's steps and template | that skill's `SKILL.md` |

**IDs are addresses.** Reuse the shapes in the README's ID table. Never
renumber or reuse an ID. A dropped item is marked `(dropped: reason)`. If a
new skill needs a new ID shape, add it to that table in the same change.

**Artifacts are written to the repository being worked on,** never to this
one:

```
<repo>/
  README.md, docs/              project documentation (PD-1 … PD-10)
  CONSTRAINTS.md                the quality bar
  .specs/context.md             repository map
  .specs/<slug>/
    story.md  sketch.md  tasks.md  design.md  spec.md  plan.md  pr.md
    evidence/                   test-<date>.md, release-<date>.md
    defects/                    D-<n>.md
```

`<slug>` is chosen once, when the story is written, and reused by every
later stage. If the repository uses its own spec tool, keep that tool's
format and storage.

## Changing a skill

1. Make the smallest edit that changes the agent's behavior the way you
   intend. Do not reword what already works.
2. Keep the template stable. Other stages read it.
3. Run the checks below.

To change a shared rule, edit `docs/operating-contract.md` and run
`node .github/scripts/check-skills.mjs --fix`.

## Adding a skill

1. Create `skills/spine-<name>/SKILL.md` following the anatomy.
2. Leave the body of `## Operating contract` empty and run the checker with
   `--fix` to stamp it.
3. Add the skill to the lifecycle table, the remove command, and (if it
   creates one) the ID table in `README.md`.
4. Run the checks below.

## Checks

```bash
node .github/scripts/check-skills.mjs        # format, budget, contract, self-containment
node --test .github/scripts/*.test.mjs       # the checker's own tests
npx skills add . --list                      # names and descriptions read well
```

CI runs the first two on every push and pull request, performs a real
install that fails if any skill directory does not install, and scans the
repository for secrets. The checker also rejects a skill whose name does not
start with `spine-`.

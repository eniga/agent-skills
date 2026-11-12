---
name: spine-simplify
description: Makes named code easier to read and maintain without changing its observable behavior, pinned by tests that pass unchanged before and after. Use when code works but is harder to read or change than it should be. Use when a review flagged complexity, duplication, dead code, or naming.
---

# Spine Simplify

## Overview

Make code clearer without changing what it does. **Behavior is the
invariant: the same tests pass, unedited, before and after.** Simplify what
hurts, and leave clear code alone.

## When to Use

- Code works but is hard to read or change.
- A review flagged complexity, duplication, dead code, or naming.
- Code is too tangled to change safely: simplify first, then change.

**Not for:** buggy code (find and fix the bug first, or the bug is
preserved); clear code you would simply write differently; a hunt through
the repository for anything to improve.

## Inputs

| Input | Where | If missing |
|---|---|---|
| Code to simplify | a named file, function, module, or diff | Stop. Ask what to simplify. |
| Tests that pin its behavior | the test suite | Stop and write them first (step 1). |
| Thresholds `C-*` | `CONSTRAINTS.md` | Proceed with the checklist in step 3 and say so. |

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

1. **Pin the behavior.** Confirm tests exercise the target code. If none do,
   write them against its current observable behavior and watch them pass.
2. **Record the baseline:** run the focused tests and keep the command and
   result.
3. **Name what is actually hard.** Simplify only these:

   | Problem | Sign |
   |---|---|
   | Depth | Nesting past three levels, or a function doing several things. |
   | Indirection | A wrapper or helper that adds a hop and no concept. |
   | Duplication | The same knowledge written in three or more places. |
   | Dead code | Unreachable branches, unused parameters, commented-out blocks. |
   | Cleverness | A line that needs a paragraph to explain. |
   | Naming | A name that makes the reader look the thing up. |

4. **Check every removal.** Before deleting a check, branch, or step you did
   not write, find what it protects: `git blame`, its tests, its callers. If
   you cannot name the reason it exists, leave it and report the question.
5. **Change one concern at a time:** rename, then flatten, then extract.
   Re-run the focused tests after each step.
6. **Prove nothing changed.** The focused tests pass with no test edited.
   Then run the wider suite for the area.
7. **Write the note** using Output, then report.

## Rules

- Public signatures, return values, errors, and side effects stay exactly
  the same. Callers must not need to change.
- An edit that changes behavior is not simplification. Stop and report it as
  a defect or a new requirement.
- Never edit a test to make the simplified code pass.
- Prefer the boring version a new reader understands in one pass. Shorter is
  not clearer.
- Rename before you restructure. A better name is often the whole fix.
- Extract shared code only for the same knowledge repeated three times. Code
  that merely looks alike stays separate.
- Stay inside the target the user named. Similar code elsewhere is a
  follow-up.
- If the target is too large for one session, simplify the worst part and
  leave the rest whole. Never stop mid-refactor.

## Output

The simplified code, plus this note in the conversation, commit, or PR:

```markdown
## Simplification: <target>

- **Was hard because:** <depth / indirection / duplication / dead code / cleverness / naming>
- **Changed:** <one line per concern, in order>
- **Left in place:** <code whose purpose is unknown, and the open question>
- **Baseline:** `<command>` -> <result>
- **After:** `<command>` -> <same result, no test edited>
- **Wider suite:** `<command>` -> <result>
- **Found, not fixed:** <bugs or missing requirements, or "none">
- **Follow-ups:** <similar code elsewhere, or "none">
```

## Verification

- [ ] Tests covered the target before the first edit.
- [ ] The baseline run is recorded.
- [ ] Each edit is one concern, inside the named target.
- [ ] No public signature, output, error, or side effect changed.
- [ ] Everything removed was dead or explained; unexplained code was left
      and reported.
- [ ] The focused tests pass with no test edited, and the wider suite passes.
- [ ] Bugs found were reported, not fixed.

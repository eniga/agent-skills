---
name: code-simplify
description: Simplifies code for clarity without changing its behavior, applying Chesterton's Fence and reducing complexity while preserving exact observable behavior. Use when code works but is harder to read or maintain than it should be. Use when a change is being reviewed and complexity is a finding.
---

# Code Simplify

## Overview

Make code easier to read and maintain without changing what it does.
Simplification is a behavior-preserving refactor: the observable behavior
before and after must be identical, and the tests that prove it must pass
unchanged. Clarity over cleverness, every time.

## When to Use

- Code works but is harder to read or maintain than it should be.
- A review (`review` or `ai-code-review`) flagged complexity as a finding.
- You are about to modify code and it is too tangled to change safely —
  simplify first, then change.
- Dead code, duplication, or an abstraction that earns its keep no longer
  is present.

**When NOT to use:** The code is buggy (fix the bug first — simplifying a
broken function preserves the bug with better formatting). The behavior is
unspecified or untested (add the tests that pin the behavior first; you
cannot prove "no behavior change" against nothing). The code is clear and you
simply prefer a different style (taste is not a finding — do not churn).

## Process

1. **Pin the behavior first.** Before touching anything, confirm there are
   tests that exercise the code you will simplify — the unit tests for the
   function, the integration tests for the flow. If there are none, **stop
   and write them now** (or hand back to `build`/`test`). Simplification
   without a behavioral net is a behavior change with extra steps.
2. **Run the tests and record the baseline.** Run the focused tests for the
   target code and confirm they pass. This is the "before" evidence.
3. **Identify the complexity.** Name what is actually hard, using the
   checklist below. Do not simplify what is not complex — churn is a cost.
   - **Depth:** nesting deeper than 3 levels, or a function doing more than
     one thing.
   - **Indirection:** an abstraction, wrapper, or helper that adds a hop
     without adding a concept.
   - **Duplication:** the same logic in two or more places.
   - **Dead code:** unreachable branches, unused parameters, commented-out
     blocks, flags that are always on.
   - **Cleverness:** a one-liner that takes a paragraph to explain, a trick
     that trades obviousness for brevity.
   - **Naming:** a name that forces the reader to look up what the thing is.
4. **Apply Chesterton's Fence.** Before removing anything you did not write
   — a check, a branch, a seemingly-redundant step — figure out what it is
   fencing. If you cannot name the problem it solves, **do not remove it**;
   mark it with a comment naming the question and move on. Removing a fence
   you do not understand is how a years-old workaround becomes a production
   incident.
5. **Simplify one concern at a time.** Make one kind of change per edit
   (flatten the nesting, then extract the duplication, then rename). Small,
   reviewable steps mean a regression can be attributed to a specific change.
   After each step, re-run the focused tests.
6. **Prove the behavior is unchanged.** Re-run the focused tests — they must
   pass unchanged (no test edited). Then run the wider suite for the area to
   catch interactions. The "after" evidence must match the "before" behavior.
7. **Record the before/after.** Note what was complex, what you changed, and
   the test evidence that behavior is preserved. If this is part of a review
   finding, reference the finding.
8. **Stop.** Do not change behavior, do not add features, do not "improve"
   beyond clarity. If simplification reveals a bug or a missing requirement,
   stop and report it — do not fix it inside a simplification.

## The Rule of 500

If a function or file is so large that simplifying it would take more than a
focused session, do not attempt the whole thing. Simplify the worst 20% —
the part that actually hurts — and leave the rest. A half-simplified clear
function beats a fully-simplified one you ran out of steam on and left
mid-refactor.

## Writing rules

- **Behavior is the invariant.** Every edit must be explainable as "this does
  the same thing, more clearly". If an edit changes what the code does, it
  is not simplification — stop and route it to the right skill.
- **Prefer the boring version.** The version a new reader understands in one
  pass beats the version that is shorter. Explicit over clever, every time.
- **Names are simplification.** Often the highest-leverage change is a better
  name, not a structural one. Rename before you restructure.
- **Delete confidently, but only what is dead.** Dead code goes. Code whose
  purpose you cannot state stays, flagged.
- **No drive-by changes.** Do not reformat untouched lines, reorder imports,
  or "fix" adjacent code while simplifying. The diff should be only the
  simplification.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "There are no tests, but the change is obviously behavior-preserving" | "Obviously" is the exact word that has shipped regressions. Without a test, you cannot prove preservation — and the next reader cannot either. Pin the behavior first. |
| "I'll remove this check, it can never trigger" | You did not write it, so you do not know what it is fencing. Chesterton's Fence: name the problem it solves or leave it. "Can never trigger" is a claim, not evidence. |
| "I'll simplify and fix the bug I found at the same time" | A simplification that also changes behavior is two changes in one diff — when it regresses, you cannot say which. Simplify (behavior-preserving), then fix the bug as its own change with its own tests. |
| "The one-liner is shorter, so it's better" | Shorter is not clearer. A one-liner that needs a comment to explain is longer than the four lines it replaced, once you count the comment. |
| "I'll reformat the whole file while I'm here" | Drive-by formatting buries the real change in noise and makes the review about whitespace. The diff should be only the simplification. |
| "It's clear enough, but I'd write it differently" | Taste is not a finding. If the current code is clear, leaving it is the correct outcome. Churning clear code into your preferred style is a cost with no benefit. |

## Red Flags

- Simplification starting with no tests for the target code.
- A test edited to make the "simplified" code pass (the net was cut).
- A removed check, branch, or step whose purpose was never stated.
- A diff full of reformatted untouched lines alongside the real change.
- A behavior change hiding inside a "simplification".
- A function left half-refactored because the session ran out.
- "Obviously behavior-preserving" used in place of test evidence.

## Verification

Before returning, confirm:

- [ ] Tests that exercise the target code existed before any edit (or were written first).
- [ ] The baseline (before) test run passed and is recorded.
- [ ] Every removed or changed element was either dead code or a clarity improvement — and any fence you did not remove is flagged with the open question.
- [ ] Each edit is one concern; the diff contains no drive-by formatting or behavior changes.
- [ ] The focused tests pass unchanged (no test edited) after the simplification.
- [ ] The wider suite for the area passes.
- [ ] A before/after note records what was complex, what changed, and the test evidence.
- [ ] Any bug or missing requirement discovered was reported, not fixed in-line.

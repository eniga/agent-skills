// Pins the observable behavior of check-skills.mjs — exit codes, stdout,
// and exact error messages — against fixture skill trees in temp dirs.
// These tests predate the simplification pass; they must pass unchanged
// before and after it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const SCRIPT = join(import.meta.dirname, "check-skills.mjs");

// A minimal skill that passes every check.
function validSkill(name) {
  return [
    "---",
    `name: ${name}`,
    "description: Does the thing. Use when the thing is needed.",
    "---",
    "",
    "## Overview",
    "",
    "Body.",
    "",
    "## When to Use",
    "",
    "When.",
    "",
    "## Inputs",
    "",
    "None.",
    "",
    "## Common Rationalizations",
    "",
    "| R | Reality |",
    "|---|---|",
    "| one | two |",
    "",
    "## Red Flags",
    "",
    "- one",
    "",
    "## Verification",
    "",
    "- [ ] done",
  ].join("\n");
}

// Append blank lines until the text has exactly `total` lines as split by "\n".
function padTo(text, total) {
  const lines = text.split("\n");
  return lines.concat(Array.from({ length: total - lines.length }, () => "")).join("\n");
}

// Build a temp repo with the given skills (name -> SKILL.md text; null =
// directory without SKILL.md) and run the checker against it from there.
async function runChecker(skills) {
  const root = await mkdtemp(join(tmpdir(), "check-skills-"));
  try {
    for (const [name, text] of Object.entries(skills)) {
      const dir = join(root, "skills", name);
      await mkdir(dir, { recursive: true });
      if (text !== null) await writeFile(join(dir, "SKILL.md"), text);
    }
    try {
      const { stdout } = await run(process.execPath, [SCRIPT], { cwd: root });
      return { status: 0, stdout, stderr: "" };
    } catch (err) {
      return { status: err.code, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("a valid skill passes", async () => {
  const { status, stdout } = await runChecker({ foo: validSkill("foo") });
  assert.equal(status, 0);
  assert.equal(stdout, "✓ 1 skills valid.\n");
});

test("a directory without SKILL.md fails", async () => {
  const { status, stderr } = await runChecker({ foo: null });
  assert.equal(status, 1);
  assert.match(stderr, /skills\/foo\/SKILL\.md: no SKILL\.md/);
});

test("missing frontmatter fails", async () => {
  const { status, stderr } = await runChecker({ foo: "# foo\n\nNo frontmatter here.\n" });
  assert.equal(status, 1);
  assert.match(stderr, /missing or malformed frontmatter/);
});

test("frontmatter without a name fails", async () => {
  const { status, stderr } = await runChecker({
    foo: validSkill("foo").replace("name: foo\n", ""),
  });
  assert.equal(status, 1);
  assert.match(stderr, /frontmatter has no `name`/);
});

test("name that does not match the directory fails", async () => {
  const { status, stderr } = await runChecker({ foo: validSkill("bar") });
  assert.equal(status, 1);
  assert.match(stderr, /name "bar" does not match directory "foo"/);
});

test("name that is not lowercase-hyphenated fails", async () => {
  // The name must equal the directory (or the mismatch check fires first),
  // so the directory itself carries the bad name.
  const { status, stderr } = await runChecker({ "Foo-Bar": validSkill("Foo-Bar") });
  assert.equal(status, 1);
  assert.match(stderr, /name "Foo-Bar" is not lowercase-hyphenated/);
});

test("frontmatter without a description fails", async () => {
  const { status, stderr } = await runChecker({
    foo: validSkill("foo").replace(/^description:.*\n/m, ""),
  });
  assert.equal(status, 1);
  assert.match(stderr, /frontmatter has no `description`/);
});

test("description over 1024 characters fails", async () => {
  const description = `Use when ${"x".repeat(1016)}`; // 1025 chars
  const { status, stderr } = await runChecker({
    foo: validSkill("foo").replace(
      /description:.*\n/,
      `description: ${description}\n`,
    ),
  });
  assert.equal(status, 1);
  assert.match(stderr, /description is 1025 chars \(max 1024\)/);
});

test("description of exactly 1024 characters passes", async () => {
  const description = `Use when ${"x".repeat(1015)}`; // 1024 chars
  const { status } = await runChecker({
    foo: validSkill("foo").replace(
      /description:.*\n/,
      `description: ${description}\n`,
    ),
  });
  assert.equal(status, 0);
});

test("description without a Use-when trigger fails", async () => {
  const { status, stderr } = await runChecker({
    foo: validSkill("foo").replace(
      /description:.*\n/,
      "description: Does the thing for everyone, always.\n",
    ),
  });
  assert.equal(status, 1);
  assert.match(stderr, /description states no `Use when` trigger/);
});

test("a backticked reference to a sibling skill fails", async () => {
  const { status, stderr } = await runChecker({
    alpha: validSkill("alpha").replace("Body.", "See `my-tool` for details."),
    "my-tool": validSkill("my-tool"),
  });
  assert.equal(status, 1);
  assert.match(stderr, /references another skill \(`my-tool`\)/);
});

test("a reference to the skill's own name passes", async () => {
  const { status } = await runChecker({
    alpha: validSkill("alpha").replace("Body.", "This is `alpha`."),
  });
  assert.equal(status, 0);
});

test("an unbackticked mention of a sibling skill passes", async () => {
  const { status } = await runChecker({
    alpha: validSkill("alpha").replace("Body.", "See my-tool for details."),
    "my-tool": validSkill("my-tool"),
  });
  assert.equal(status, 0);
});

test("more than 500 lines fails", async () => {
  const { status, stderr } = await runChecker({ foo: padTo(validSkill("foo"), 501) });
  assert.equal(status, 1);
  assert.match(stderr, /501 lines \(max 500\)/);
});

test("exactly 500 lines passes", async () => {
  const { status } = await runChecker({ foo: padTo(validSkill("foo"), 500) });
  assert.equal(status, 0);
});

test("headings inside code fences do not count", async () => {
  // The only `## Overview` in the file is inside a fenced block, so it must
  // not count as a section.
  const text = validSkill("foo").replace("## Overview\n", "```text\n## Overview\n```\n");
  const { status, stderr } = await runChecker({ foo: text });
  assert.equal(status, 1);
  assert.match(stderr, /missing section "## Overview"/);
});

test("an unclosed code fence fails", async () => {
  const { status, stderr } = await runChecker({
    foo: validSkill("foo").replace("Body.", "```\nBody."),
  });
  assert.equal(status, 1);
  assert.match(stderr, /unclosed code fence/);
});

test("errors from multiple skills are all reported", async () => {
  const { status, stderr } = await runChecker({
    "bad-a": null,
    "bad-b": validSkill("bad-b").replace("## Red Flags\n", ""),
  });
  assert.equal(status, 1);
  assert.match(stderr, /no SKILL\.md/);
  assert.match(stderr, /missing section "## Red Flags"/);
});

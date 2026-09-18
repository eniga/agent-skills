// Validates every skills/<name>/SKILL.md against docs/skill-anatomy.md.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_SECTIONS = [
  "## Overview",
  "## When to Use",
  "## Common Rationalizations",
  "## Red Flags",
  "## Verification",
];
const MAX_DESCRIPTION = 1024;
const MAX_LINES = 500;

const errors = [];
const dirs = readdirSync("skills", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const dir of dirs) {
  const path = join("skills", dir, "SKILL.md");
  const fail = (msg) => errors.push(`${path}: ${msg}`);
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    fail("no SKILL.md");
    continue;
  }

  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!frontmatter) {
    fail("missing or malformed frontmatter");
    continue;
  }

  const name = /^name:\s*(.+)$/m.exec(frontmatter[1])?.[1].trim();
  const description = /^description:\s*(.+)$/m.exec(frontmatter[1])?.[1].trim();

  if (!name) fail("frontmatter has no `name`");
  else if (name !== dir) fail(`name "${name}" does not match directory "${dir}"`);
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail(`name "${name}" is not lowercase-hyphenated`);

  if (!description) fail("frontmatter has no `description`");
  else if (description.length > MAX_DESCRIPTION)
    fail(`description is ${description.length} chars (max ${MAX_DESCRIPTION})`);
  else if (!/\bUse when\b/.test(description))
    fail("description states no `Use when` trigger");

  const lines = text.split("\n");
  if (lines.length > MAX_LINES) fail(`${lines.length} lines (max ${MAX_LINES})`);

  // Headings inside fenced blocks are template content, not document structure.
  const headings = new Set();
  let fenced = false;
  for (const line of lines) {
    if (line.startsWith("```")) fenced = !fenced;
    else if (!fenced && line.startsWith("## ")) headings.add(line.trim());
  }
  if (fenced) fail("unclosed code fence");
  for (const section of REQUIRED_SECTIONS) {
    if (!headings.has(section)) fail(`missing section "${section}"`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${dirs.length} skills valid.`);

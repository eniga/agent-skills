// Validates every skills/<name>/SKILL.md against docs/skill-anatomy.md.
// `--fix` restamps each skill's Operating contract from docs/operating-contract.md.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_SECTIONS = [
  "## Overview",
  "## When to Use",
  "## Inputs",
  "## Operating contract",
  "## Process",
  "## Rules",
  "## Output",
  "## Verification",
];
// Every skill name carries the pack prefix so it cannot collide with a
// built-in command or another pack's skill.
const PREFIX = "spine-";
const MAX_DESCRIPTION = 1024;
const MAX_LINES = 200;
const CONTRACT_HEADING = "## Operating contract";
const CONTRACT_PATH = join("docs", "operating-contract.md");

const fix = process.argv.includes("--fix");
// The contract is written once and stamped into every skill, because a
// per-skill install copies only that skill's directory.
const contract = existsSync(CONTRACT_PATH)
  ? readFileSync(CONTRACT_PATH, "utf8").trim()
  : null;

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
  else if (!name.startsWith(PREFIX)) fail(`name "${name}" does not start with "${PREFIX}"`);

  if (!description) fail("frontmatter has no `description`");
  else if (description.length > MAX_DESCRIPTION)
    fail(`description is ${description.length} chars (max ${MAX_DESCRIPTION})`);
  else if (!/\bUse when\b/.test(description))
    fail("description states no `Use when` trigger");

  // Self-containment: a skill must never name another skill. Each one is
  // installable on its own, and the CLI does not resolve dependencies, so a
  // reference to a skill the user did not install points at nothing.
  for (const other of dirs) {
    if (other === dir) continue;
    if (text.includes(`\`${other}\``)) {
      fail(`references another skill (\`${other}\`) — skills must be self-contained`);
    }
  }

  let lines = text.split("\n");

  // Headings inside fenced blocks are template content, not document structure.
  const sectionStarts = () => {
    const starts = [];
    let fenced = false;
    lines.forEach((line, i) => {
      if (line.startsWith("```")) fenced = !fenced;
      else if (!fenced && line.startsWith("## ")) starts.push(i);
    });
    return { starts, fenced };
  };

  let { starts, fenced } = sectionStarts();
  if (fenced) fail("unclosed code fence");

  const at = starts.find((i) => lines[i].trim() === CONTRACT_HEADING);
  if (contract !== null && at !== undefined) {
    const end = starts.find((i) => i > at) ?? lines.length;
    if (lines.slice(at + 1, end).join("\n").trim() !== contract) {
      if (fix) {
        lines.splice(at + 1, end - at - 1, "", ...contract.split("\n"), "");
        writeFileSync(path, lines.join("\n"));
        ({ starts } = sectionStarts());
      } else {
        fail(`Operating contract differs from ${CONTRACT_PATH} — run with --fix`);
      }
    }
  }

  if (lines.length > MAX_LINES) fail(`${lines.length} lines (max ${MAX_LINES})`);

  const headings = new Set(starts.map((i) => lines[i].trim()));
  for (const section of REQUIRED_SECTIONS) {
    if (!headings.has(section)) fail(`missing section "${section}"`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${dirs.length} skills valid.`);

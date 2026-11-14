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

  // An unquoted YAML value may not contain ": " or " #". The skills CLI
  // silently skips a skill whose frontmatter does not parse.
  const unquoted = (v) => v && !/^(["']).*\1$/.test(v);
  for (const [key, value] of [["name", name], ["description", description]]) {
    if (unquoted(value) && /: | #/.test(value)) fail(`${key} contains ": " or " #"; quote it or reword it, or YAML will not parse`);
  }

  if (!description) fail("frontmatter has no `description`");
  else if (description.length > MAX_DESCRIPTION)
    fail(`description is ${description.length} chars (max ${MAX_DESCRIPTION})`);
  else if (!/\bUse when\b/.test(description))
    fail("description states no `Use when` trigger");

  // Self-containment: a skill must never name another skill. Each one is
  // installable on its own, and the CLI does not resolve dependencies, so a
  // reference to a skill the user did not install points at nothing.
  // Bare names count too, so "run spine-build next" fails like `spine-build`.
  for (const other of dirs) {
    if (other === dir) continue;
    if (new RegExp(`(?<![\\w-])${other}(?![\\w-])`).test(text)) {
      fail(`references another skill (\`${other}\`) — skills must be self-contained`);
    }
  }

  // Every references/ file the skill names exists, and every file shipped in
  // references/ is named, so a rename cannot silently break a step.
  const refDir = join("skills", dir, "references");
  const named = new Set([...text.matchAll(/references\/([\w.-]+\.\w+)/g)].map((m) => m[1]));
  const shipped = existsSync(refDir) ? readdirSync(refDir) : [];
  for (const file of named) if (!shipped.includes(file)) fail(`names references/${file}, which does not exist`);
  for (const file of shipped) if (!named.has(file)) fail(`ships references/${file} but never names it`);

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

  // Section budgets from docs/skill-anatomy.md. Fenced lines are template
  // content and are not counted.
  let inFence = false;
  const prose = lines.map((line) => {
    if (line.startsWith("```")) {
      inFence = !inFence;
      return "";
    }
    return inFence ? "" : line;
  });
  const body = (heading) => {
    const at = starts.find((i) => lines[i].trim() === heading);
    if (at === undefined) return [];
    return prose.slice(at + 1, starts.find((i) => i > at) ?? lines.length);
  };
  const within = (label, n, min, max) => {
    if (n < min || n > max) fail(`${label} is ${n} (budget ${min} to ${max})`);
  };
  within("Overview length in lines", body("## Overview").filter((l) => l.trim()).length, 3, 6);
  within("When to Use length in lines", body("## When to Use").filter((l) => l.trim()).length, 1, 9);
  within("Inputs rows", body("## Inputs").filter((l) => l.startsWith("|")).length - 2, 3, 6);
  within("Rules bullets", body("## Rules").filter((l) => l.startsWith("- ")).length, 5, 8);
  within("Verification boxes", body("## Verification").filter((l) => l.startsWith("- [ ]")).length, 6, 10);
  // A multi-mode skill has one "### Mode" group per mode; the step budget
  // applies to each group.
  const groups = [0];
  for (const line of body("## Process")) {
    if (line.startsWith("### ")) groups.push(0);
    else if (/^\d+\.\s/.test(line)) groups[groups.length - 1]++;
  }
  const modes = groups.length > 1 ? groups.slice(1) : groups;
  if (groups.length > 1 && groups[0] > 0) fail("Process has numbered steps before its first ### group");
  if (groups.length === 1) within("Process steps", groups[0], 6, 12);
  else modes.forEach((n, i) => within(`Process steps in group ${i + 1}`, n, 1, 12));
}

if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${dirs.length} skills valid.`);

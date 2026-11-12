// Pins the behavior of the commit-message gate that ships with
// spine-constraints: which messages pass, which fail, in hook and range mode.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const SCRIPT = join(
  import.meta.dirname,
  "../../skills/spine-constraints/references/commit-msg.sh",
);

async function inTemp(fn) {
  const dir = await mkdtemp(join(tmpdir(), "commit-msg-"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function status(cmd, args, cwd) {
  try {
    await run(cmd, args, { cwd });
    return 0;
  } catch (err) {
    return err.code;
  }
}

// Run the gate as a commit-msg hook against one message.
const hook = (message) =>
  inTemp(async (dir) => {
    await writeFile(join(dir, "MSG"), message);
    return status("sh", [SCRIPT, join(dir, "MSG")], dir);
  });

const passes = [
  "feat(payment-retries): retry on timeout (SL-2, R-4)",
  "fix: handle duplicate lines\n\nFixes D-7.",
  "refactor(cart): flatten totals\n\nNo behavior change. R-3",
  "docs: explain the retry policy",
  "chore(deps): bump lockfile",
  "ci!: split the pipeline",
  "test(cart): cover empty carts",
  "Merge branch 'main' into feature",
  'Revert "feat: retry on timeout"',
  "fixup! feat: retry on timeout",
  "# comment line git adds\nfeat: retry (R-1)\n# Please enter the commit message",
];

const fails = [
  "feat(payment-retries): retry on timeout",
  "fix typo in handler",
  "update stuff",
  "feat: merge PR-12 changes", // PR-12 is not R-12
  "feat: follows ADR-3", // ADR-3 is not R-3
  "feat: retry\n# cites R-1 only in a comment",
];

for (const message of passes) {
  test(`passes: ${JSON.stringify(message.split("\n")[0])}`, async () => {
    assert.equal(await hook(message), 0);
  });
}

for (const message of fails) {
  test(`fails: ${JSON.stringify(message.split("\n")[0])}`, async () => {
    assert.equal(await hook(message), 1);
  });
}

test("--range checks every commit in the range and ignores earlier ones", async () => {
  await inTemp(async (dir) => {
    const git = (...args) =>
      run("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", ...args], { cwd: dir });
    const commit = (message) => git("commit", "-q", "--allow-empty", "-m", message);
    await git("init", "-q", "-b", "main");
    await commit("legacy commit with no id");
    await git("checkout", "-q", "-b", "feature");
    await commit("feat: add retries (SL-1, R-1)");
    await commit("docs: describe retries");
    assert.equal(await status("sh", [SCRIPT, "--range", "main..feature"], dir), 0);

    await commit("feat: sneak in an extra");
    assert.equal(await status("sh", [SCRIPT, "--range", "main..feature"], dir), 1);
  });
});

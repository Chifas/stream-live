#!/usr/bin/env node
// PostToolUse hook (Write|Edit): format + lint the file Claude just touched.
const { execFileSync } = require("node:child_process");

let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(data);
  } catch {
    return;
  }
  const file = input?.tool_input?.file_path;
  if (!file) return;
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  for (const args of [
    ["prettier", "--write", file],
    ["eslint", "--fix", file],
  ]) {
    try {
      execFileSync(npx, args, { stdio: "pipe", shell: process.platform === "win32" });
    } catch {
      // best-effort; a formatter/linter failure shouldn't block the turn
    }
  }
});

#!/usr/bin/env node
// PreToolUse hook (Write|Edit): block edits to the live dev DB and real .env files.
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
  const norm = file.replace(/\\/g, "/");
  const isDb = /(^|\/)data\/stream\.db$/.test(norm);
  const isEnv = /(^|\/)\.env(\.[^/]+)?$/.test(norm) && !norm.endsWith(".env.example");
  if (isDb || isEnv) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: isDb
            ? "data/stream.db is the live seeded dev database — change src/db/schema.ts / client.ts instead of editing the file directly."
            : ".env files hold live secrets (AUTH_SECRET, REDIS_URL) — edit .env.example instead if you need to document a new variable.",
        },
      }),
    );
  }
});

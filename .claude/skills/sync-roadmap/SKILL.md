---
name: sync-roadmap
description: Update MEJORAS.md to reflect a feature that just shipped
user-invocable: false
---

# Sync roadmap

`MEJORAS.md` is the hand-maintained status/roadmap doc for StreamLive. It has
two sections:

- **"✅ Ya implementado"** — a flat bullet list of shipped features.
- **"🔜 Pendiente"** — numbered subsections of `- [ ]` checkboxes grouped by
  area (streaming infra, backend scaling, auth, monetization, chat, discovery,
  quality/ops, deploy), plus a trailing **"Deuda técnica conocida"** list.

Invoke this after finishing a feature (a commit or a chunk of work is about
to land) that changes what's true in that doc.

## Steps

1. Diff what changed against what MEJORAS.md currently claims — read the file
   first, don't assume its contents from memory.
2. If a pending item (`- [ ]`) was just completed, convert it in place to the
   file's existing "done" convention: `- [x] ~~<original text>~~ ✅ hecho` (see
   existing entries for the exact phrasing style), and add a short bullet
   under "Ya implementado" if it's a user-facing feature, not just an internal
   tweak to an already-shipped item.
3. If the work reveals new pending work (e.g. finishing Redis pub/sub but
   noting per-instance viewer counts are still unmerged), add or refine a
   `- [ ]` line in the matching numbered subsection — don't invent a new
   subsection unless nothing existing fits.
4. If the work resolves or changes an item under "Deuda técnica conocida",
   update or remove that line.
5. Keep the doc in Spanish, matching its existing tone (terse, bullet-first,
   bold on key nouns) — don't rewrite unrelated lines.
6. Show the user the diff to MEJORAS.md before considering the task done;
   this is a living doc they read, not generated output.

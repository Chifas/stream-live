---
name: db-migration
description: Add or change a column/table in StreamLive's SQLite schema, keeping schema.ts, the bootstrap SQL, and the lightweight migrate() step in sync
disable-model-invocation: true
---

# DB migration (StreamLive)

This project does **not** apply `drizzle-kit generate` migrations at runtime.
`drizzle.config.ts` exists for optional future use, but the actual schema
lifecycle lives in `src/db/client.ts`:

1. `BOOTSTRAP_SQL` — `CREATE TABLE IF NOT EXISTS ...` statements that define
   the schema for a brand-new database.
2. `migrate(client)` — idempotent `ALTER TABLE ... ADD COLUMN` calls (wrapped
   in try/catch, since SQLite errors if the column already exists) for
   columns added *after* a table already shipped. This is what upgrades an
   existing dev DB (`./data/stream.db`) without wiping it.
3. `src/db/schema.ts` — the Drizzle schema Drizzle-ORM queries against; must
   match what BOOTSTRAP_SQL/migrate produce or queries will fail at runtime.
4. `src/db/seed.ts` — seed data, only applied via `seedIfEmpty` when tables
   are empty; update it if the new column needs a sensible demo default.

## Steps for a new column on an existing table

1. Add the column to the relevant `CREATE TABLE` block in `BOOTSTRAP_SQL`
   (so fresh databases get it from scratch).
2. Add a matching `await addColumn("ALTER TABLE <table> ADD COLUMN <col> <type>")`
   line in `migrate()` (so existing dev/prod databases get it too).
3. Add the field to the corresponding table definition in `src/db/schema.ts`
   with the matching Drizzle column type.
4. Update `src/db/seed.ts` if seeded rows should populate the new column.
5. Update any `src/lib/queries.ts` / `src/lib/types.ts` reads or writes that
   should carry the new field through.
6. Delete `./data/stream.db` locally (or accept `migrate()` patching it on
   next `getDb()` call) and run `npm run dev` to verify both paths — fresh
   bootstrap and in-place migrate — produce the same schema.

## Steps for a new table

1. Add a `CREATE TABLE IF NOT EXISTS` block to `BOOTSTRAP_SQL`.
2. Add the table to `src/db/schema.ts`.
3. No `migrate()` entry needed — `CREATE TABLE IF NOT EXISTS` already handles
   both fresh and existing databases.
4. Wire up seed data in `src/db/seed.ts` if needed.

Never hand-edit `./data/stream.db` directly, and never delete it without
checking first whether it holds data the user wants to keep — it's the live
dev/demo database.

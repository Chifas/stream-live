import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

/**
 * Cliente de base de datos (libSQL / SQLite local mediante fichero).
 * En producción se puede apuntar `DATABASE_URL` a una BD remota (Turso) sin
 * cambiar el código.
 */

function resolveUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const dir = path.join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  // libSQL espera una URL `file:` con barras normales.
  return `file:${path.join(dir, "stream.db").replace(/\\/g, "/")}`;
}

let _client: Client | null = null;
let _db: LibSQLDatabase<typeof schema> | null = null;
let _ready: Promise<void> | null = null;

function raw(): Client {
  if (!_client) _client = createClient({ url: resolveUrl() });
  return _client;
}

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  color TEXT NOT NULL DEFAULT '#a970ff',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  owner_user_id TEXT,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  tags TEXT NOT NULL,
  hls_url TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  base_viewers INTEGER NOT NULL DEFAULT 0,
  is_live INTEGER NOT NULL DEFAULT 1,
  followers INTEGER NOT NULL DEFAULT 0,
  about TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  viewers INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  channel_slug TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS follows_user_channel ON follows (user_id, channel_slug);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  channel_slug TEXT NOT NULL,
  user_id TEXT,
  username TEXT NOT NULL,
  color TEXT NOT NULL,
  text TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_channel_ts ON messages (channel_slug, ts);
CREATE TABLE IF NOT EXISTS moderation (
  id TEXT PRIMARY KEY,
  channel_slug TEXT NOT NULL,
  target_username TEXT NOT NULL,
  type TEXT NOT NULL,
  until_ts INTEGER,
  by_username TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

/** Inicializa el esquema y siembra datos una sola vez (memoizado). */
export function getDb(): Promise<LibSQLDatabase<typeof schema>> {
  if (!_ready) {
    _ready = (async () => {
      await raw().executeMultiple(BOOTSTRAP_SQL);
      _db = drizzle(raw(), { schema });
      const { seedIfEmpty } = await import("./seed");
      await seedIfEmpty(_db);
    })();
  }
  return _ready.then(() => _db!);
}

export { schema };

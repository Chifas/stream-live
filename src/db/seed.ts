import { randomUUID } from "node:crypto";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { CHANNELS as SEED_CHANNELS, CATEGORIES as SEED_CATEGORIES } from "@/lib/seed-data";
import { hashPassword } from "@/lib/password";

/** Siembra datos de demo la primera vez (si la tabla de canales está vacía). */
export async function seedIfEmpty(db: LibSQLDatabase<typeof schema>) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.channels);
  if (count > 0) return;

  const now = Date.now();

  // Usuarios de demo.
  const adminId = randomUUID();
  const creatorId = randomUUID();
  const modId = randomUUID();
  await db.insert(schema.users).values([
    {
      id: adminId,
      username: "admin",
      passwordHash: await hashPassword("admin1234"),
      role: "admin",
      color: "#ff6ad5",
      createdAt: now,
    },
    {
      id: creatorId,
      username: "streamer",
      passwordHash: await hashPassword("demo1234"),
      role: "creator",
      color: "#4cc9f0",
      createdAt: now,
    },
    {
      id: modId,
      username: "espectador",
      passwordHash: await hashPassword("demo1234"),
      role: "viewer",
      color: "#90be6d",
      createdAt: now,
    },
  ]);

  await db.insert(schema.categories).values(
    SEED_CATEGORIES.map((c) => ({
      id: randomUUID(),
      slug: c.slug,
      name: c.name,
      coverUrl: c.coverUrl,
      viewers: c.viewers,
    })),
  );

  await db.insert(schema.channels).values(
    SEED_CHANNELS.map((c) => ({
      id: randomUUID(),
      slug: c.slug,
      // El primer canal pertenece al usuario "streamer" (para demo de moderación).
      ownerUserId: c.slug === "nova_plays" ? creatorId : null,
      streamKey: c.slug,
      displayName: c.displayName,
      category: c.category,
      title: c.title,
      language: c.language,
      tags: c.tags,
      hlsUrl: c.hlsUrl,
      avatarUrl: c.avatarUrl,
      thumbnailUrl: c.thumbnailUrl,
      baseViewers: c.baseViewers,
      isLive: c.isLive,
      followers: c.followers,
      about: c.about,
    })),
  );
}

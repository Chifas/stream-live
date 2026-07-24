import { randomUUID } from "node:crypto";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { CHANNELS as SEED_CHANNELS, CATEGORIES as SEED_CATEGORIES } from "@/lib/seed-data";
import { hashPassword } from "@/lib/password";

/** Usuarios de demo. `owns` = slug del canal del que es dueño (opcional). */
const DEMO_USERS: {
  username: string;
  password: string;
  role: "admin" | "creator" | "viewer";
  color: string;
  owns?: string;
}[] = [
  { username: "admin", password: "admin1234", role: "admin", color: "#ff6ad5" },
  { username: "streamer", password: "demo1234", role: "creator", color: "#4cc9f0", owns: "nova_plays" },
  { username: "pixelforge", password: "demo1234", role: "creator", color: "#8a6dff", owns: "pixel_forge" },
  { username: "aurorabeats", password: "demo1234", role: "creator", color: "#00d1b2", owns: "aurora_beats" },
  { username: "espectador", password: "demo1234", role: "viewer", color: "#90be6d" },
  { username: "moderador", password: "demo1234", role: "viewer", color: "#ffb703" },
];

/** Moderadores por canal: slug -> nombres de usuario. */
const DEMO_MODS: Record<string, string[]> = {
  nova_plays: ["espectador", "moderador"],
};

/** Suscriptores por canal: slug -> nombres de usuario (demo). */
const DEMO_SUBS: Record<string, string[]> = {
  nova_plays: ["espectador"],
};

// Tráiler de ejemplo (mp4 público) para que la página "Sobre el canal" se vea poblada.
const DEMO_TRAILER = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

/** Siembra datos de demo la primera vez (si la tabla de canales está vacía). */
export async function seedIfEmpty(db: LibSQLDatabase<typeof schema>) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.channels);
  if (count > 0) return;

  const now = Date.now();

  // Usuarios.
  const idByUsername = new Map<string, string>();
  const userRows = [];
  for (const u of DEMO_USERS) {
    const id = randomUUID();
    idByUsername.set(u.username, id);
    userRows.push({
      id,
      username: u.username,
      passwordHash: await hashPassword(u.password),
      role: u.role,
      color: u.color,
      createdAt: now,
    });
  }
  await db.insert(schema.users).values(userRows);

  // Mapa slug -> ownerUserId.
  const ownerBySlug = new Map<string, string>();
  for (const u of DEMO_USERS) {
    if (u.owns) ownerBySlug.set(u.owns, idByUsername.get(u.username)!);
  }

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
      ownerUserId: ownerBySlug.get(c.slug) ?? null,
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
      trailerUrl: DEMO_TRAILER,
      bio: `${c.about}\n\nHorario habitual: tardes entre semana. ¡Únete a la comunidad, participa en el chat y no te pierdas los directos!`,
      bannerUrl: `https://picsum.photos/seed/${encodeURIComponent(c.slug)}-banner/1200/300`,
      subBadgeUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(c.slug)}-sub`,
    })),
  );

  // Paneles de ejemplo para el canal principal.
  await db.insert(schema.panels).values([
    {
      id: randomUUID(),
      channelSlug: "nova_plays",
      title: "📜 Reglas del chat",
      body: "Sé respetuoso, nada de spam ni insultos. Los moderadores tienen la última palabra. ¡Diviértete!",
      imageUrl: null,
      linkUrl: null,
      position: 0,
      createdAt: now,
    },
    {
      id: randomUUID(),
      channelSlug: "nova_plays",
      title: "🔗 Mis redes",
      body: "Sígueme para no perderte nada.",
      imageUrl: null,
      linkUrl: "https://example.com",
      position: 1,
      createdAt: now,
    },
  ]);

  // Moderadores por canal.
  const modRows = [];
  for (const [slug, usernames] of Object.entries(DEMO_MODS)) {
    for (const username of usernames) {
      const userId = idByUsername.get(username);
      if (userId) {
        modRows.push({
          id: randomUUID(),
          channelSlug: slug,
          userId,
          username,
          addedBy: "seed",
          createdAt: now,
        });
      }
    }
  }
  if (modRows.length) await db.insert(schema.moderators).values(modRows);

  // Suscriptores por canal.
  const subRows = [];
  for (const [slug, usernames] of Object.entries(DEMO_SUBS)) {
    for (const username of usernames) {
      const userId = idByUsername.get(username);
      if (userId) {
        subRows.push({ id: randomUUID(), channelSlug: slug, userId, username, createdAt: now });
      }
    }
  }
  if (subRows.length) await db.insert(schema.subscribers).values(subRows);
}

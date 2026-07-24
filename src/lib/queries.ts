import "server-only";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { channels, categories, follows, moderators, panels } from "@/db/schema";
import type { Channel, Category, Panel } from "@/db/schema";

export type { Channel, Category, Panel };

export async function getPanels(slug: string): Promise<Panel[]> {
  const db = await getDb();
  return db
    .select()
    .from(panels)
    .where(eq(panels.channelSlug, slug))
    .orderBy(panels.position);
}

export async function getChannels(): Promise<Channel[]> {
  const db = await getDb();
  return db.select().from(channels).orderBy(desc(channels.baseViewers));
}

export async function getChannel(slug: string): Promise<Channel | undefined> {
  const db = await getDb();
  const rows = await db.select().from(channels).where(eq(channels.slug, slug)).limit(1);
  return rows[0];
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.select().from(categories).orderBy(desc(categories.viewers));
}

export async function getChannelByOwner(userId: string): Promise<Channel | undefined> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(channels)
    .where(eq(channels.ownerUserId, userId))
    .limit(1);
  return rows[0];
}

/** Búsqueda simple por nombre de canal, título, categoría o etiquetas. */
export async function searchChannels(query: string): Promise<Channel[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const db = await getDb();
  const pattern = `%${q}%`;
  return db
    .select()
    .from(channels)
    .where(
      or(
        like(channels.displayName, pattern),
        like(channels.title, pattern),
        like(channels.category, pattern),
        like(channels.tags, pattern),
      ),
    )
    .orderBy(desc(channels.baseViewers));
}

export async function getFollowedChannels(userId: string): Promise<Channel[]> {
  const db = await getDb();
  const rows = await db
    .select({ slug: follows.channelSlug })
    .from(follows)
    .where(eq(follows.userId, userId));
  const slugs = rows.map((r) => r.slug);
  if (slugs.length === 0) return [];
  return db.select().from(channels).where(inArray(channels.slug, slugs));
}

export async function getModeratorUsernames(slug: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .select({ username: moderators.username })
    .from(moderators)
    .where(eq(moderators.channelSlug, slug));
  return rows.map((r) => r.username);
}

export async function isFollowing(userId: string, slug: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.userId, userId), eq(follows.channelSlug, slug)))
    .limit(1);
  return rows.length > 0;
}

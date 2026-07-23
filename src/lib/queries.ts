import "server-only";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { channels, categories, follows } from "@/db/schema";
import type { Channel, Category } from "@/db/schema";

export type { Channel, Category };

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

export async function isFollowing(userId: string, slug: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.userId, userId), eq(follows.channelSlug, slug)))
    .limit(1);
  return rows.length > 0;
}

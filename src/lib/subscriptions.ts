import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { subscribers } from "@/db/schema";

export async function isSubscribed(userId: string, slug: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(and(eq(subscribers.userId, userId), eq(subscribers.channelSlug, slug)))
    .limit(1);
  return rows.length > 0;
}

export async function subscribe(userId: string, username: string, slug: string): Promise<void> {
  const db = await getDb();
  await db
    .insert(subscribers)
    .values({ id: randomUUID(), channelSlug: slug, userId, username, createdAt: Date.now() })
    .onConflictDoNothing();
}

export async function unsubscribe(userId: string, slug: string): Promise<void> {
  const db = await getDb();
  await db
    .delete(subscribers)
    .where(and(eq(subscribers.userId, userId), eq(subscribers.channelSlug, slug)));
}

import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { follows } from "@/db/schema";

export async function followChannel(userId: string, slug: string): Promise<void> {
  const db = await getDb();
  await db
    .insert(follows)
    .values({ id: randomUUID(), userId, channelSlug: slug, createdAt: Date.now() })
    .onConflictDoNothing();
}

export async function unfollowChannel(userId: string, slug: string): Promise<void> {
  const db = await getDb();
  await db
    .delete(follows)
    .where(and(eq(follows.userId, userId), eq(follows.channelSlug, slug)));
}

import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { messages, moderation, channels } from "@/db/schema";
import type { ChatMessage, Role } from "@/lib/types";

const HISTORY_LIMIT = 50;

export async function getChannelOwner(slug: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db
    .select({ owner: channels.ownerUserId })
    .from(channels)
    .where(eq(channels.slug, slug))
    .limit(1);
  return rows[0]?.owner ?? null;
}

export async function loadHistory(slug: string): Promise<ChatMessage[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.channelSlug, slug))
    .orderBy(asc(messages.ts));
  return rows.slice(-HISTORY_LIMIT).map((r) => ({
    id: r.id,
    user: r.username,
    text: r.text,
    color: r.color,
    role: r.role as Role,
    ts: r.ts,
  }));
}

export async function saveMessage(
  slug: string,
  msg: ChatMessage,
  userId: string | null,
): Promise<void> {
  const db = await getDb();
  await db.insert(messages).values({
    id: msg.id,
    channelSlug: slug,
    userId,
    username: msg.user,
    color: msg.color,
    text: msg.text,
    role: msg.role,
    ts: msg.ts,
  });
}

export async function clearMessages(slug: string): Promise<void> {
  const db = await getDb();
  await db.delete(messages).where(eq(messages.channelSlug, slug));
}

export interface Sanction {
  targetUsername: string;
  type: "timeout" | "ban";
  untilTs: number | null;
}

export async function loadModeration(slug: string): Promise<Sanction[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(moderation)
    .where(eq(moderation.channelSlug, slug));
  return rows.map((r) => ({
    targetUsername: r.targetUsername,
    type: r.type,
    untilTs: r.untilTs,
  }));
}

export async function saveSanction(
  slug: string,
  s: Sanction,
  byUsername: string,
): Promise<void> {
  const db = await getDb();
  await db
    .delete(moderation)
    .where(
      and(eq(moderation.channelSlug, slug), eq(moderation.targetUsername, s.targetUsername)),
    );
  await db.insert(moderation).values({
    id: `${slug}:${s.targetUsername}`,
    channelSlug: slug,
    targetUsername: s.targetUsername,
    type: s.type,
    untilTs: s.untilTs,
    byUsername,
    createdAt: Date.now(),
  });
}

export async function removeSanction(slug: string, targetUsername: string): Promise<void> {
  const db = await getDb();
  await db
    .delete(moderation)
    .where(
      and(eq(moderation.channelSlug, slug), eq(moderation.targetUsername, targetUsername)),
    );
}

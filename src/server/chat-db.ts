import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { messages, moderation, moderators, channels, users, follows } from "@/db/schema";
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

export interface ChannelSettings {
  ownerUserId: string | null;
  slowModeDefault: number;
  followersOnly: boolean;
  bannedWords: string[];
}

export async function getChannelSettings(slug: string): Promise<ChannelSettings> {
  const db = await getDb();
  const rows = await db
    .select({
      ownerUserId: channels.ownerUserId,
      slowModeDefault: channels.slowModeDefault,
      followersOnly: channels.followersOnly,
      bannedWords: channels.bannedWords,
    })
    .from(channels)
    .where(eq(channels.slug, slug))
    .limit(1);
  const r = rows[0];
  return {
    ownerUserId: r?.ownerUserId ?? null,
    slowModeDefault: r?.slowModeDefault ?? 0,
    followersOnly: !!r?.followersOnly,
    bannedWords: r?.bannedWords ?? [],
  };
}

export async function isFollower(userId: string, slug: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.userId, userId), eq(follows.channelSlug, slug)))
    .limit(1);
  return rows.length > 0;
}

export async function loadHistory(slug: string): Promise<ChatMessage[]> {
  const db = await getDb();
  const [rows, modIds] = await Promise.all([
    db.select().from(messages).where(eq(messages.channelSlug, slug)).orderBy(asc(messages.ts)),
    loadModerators(slug),
  ]);
  return rows.slice(-HISTORY_LIMIT).map((r) => ({
    id: r.id,
    user: r.username,
    text: r.text,
    color: r.color,
    role: r.role as Role,
    ts: r.ts,
    // Badge MOD también en el historial: si el autor es mod actual del canal.
    mod: r.role === "viewer" && !!r.userId && modIds.has(r.userId),
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

/** Devuelve el conjunto de userIds que son moderadores del canal. */
export async function loadModerators(slug: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .select({ userId: moderators.userId })
    .from(moderators)
    .where(eq(moderators.channelSlug, slug));
  return new Set(rows.map((r) => r.userId));
}

/** Añade un moderador por nombre de usuario. Devuelve su userId o null si no existe. */
export async function addModerator(
  slug: string,
  username: string,
  addedBy: string,
): Promise<string | null> {
  const db = await getDb();
  const user = (
    await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
  )[0];
  if (!user) return null;
  await db
    .insert(moderators)
    .values({
      id: randomUUID(),
      channelSlug: slug,
      userId: user.id,
      username: user.username,
      addedBy,
      createdAt: Date.now(),
    })
    .onConflictDoNothing();
  return user.id;
}

/** Quita un moderador por nombre de usuario. Devuelve su userId o null. */
export async function removeModerator(slug: string, username: string): Promise<string | null> {
  const db = await getDb();
  const user = (
    await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
  )[0];
  if (!user) return null;
  await db
    .delete(moderators)
    .where(and(eq(moderators.channelSlug, slug), eq(moderators.userId, user.id)));
  return user.id;
}

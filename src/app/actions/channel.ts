"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { channels } from "@/db/schema";
import { getSession } from "@/lib/session";
import { getChannelByOwner } from "@/lib/queries";
import { addModerator, removeModerator } from "@/server/chat-db";

export interface FormState {
  ok?: boolean;
  error?: string;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function ownedChannel() {
  const session = await getSession();
  if (!session) return null;
  const channel = await getChannelByOwner(session.userId);
  return channel ? { session, channel } : null;
}

export async function updateChannelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const owned = await ownedChannel();
  if (!owned) return { error: "No tienes ningún canal." };

  const title = String(formData.get("title") ?? "").trim().slice(0, 140);
  const category = String(formData.get("category") ?? "").trim().slice(0, 60);
  const language = String(formData.get("language") ?? "").trim().slice(0, 40);
  const about = String(formData.get("about") ?? "").trim().slice(0, 500);
  const tags = splitList(String(formData.get("tags") ?? "")).slice(0, 6);
  if (!title) return { error: "El título no puede estar vacío." };

  const db = await getDb();
  await db
    .update(channels)
    .set({ title, category, language, about, tags })
    .where(eq(channels.id, owned.channel.id));

  revalidatePath("/dashboard");
  revalidatePath(`/channel/${owned.channel.slug}`);
  return { ok: true };
}

export async function updateModerationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const owned = await ownedChannel();
  if (!owned) return { error: "No tienes ningún canal." };

  const slowModeDefault = Math.max(0, Math.min(300, Number(formData.get("slowModeDefault")) || 0));
  const followersOnly = formData.get("followersOnly") === "on";
  const bannedWords = splitList(String(formData.get("bannedWords") ?? "").toLowerCase()).slice(0, 100);

  const db = await getDb();
  await db
    .update(channels)
    .set({ slowModeDefault, followersOnly, bannedWords })
    .where(eq(channels.id, owned.channel.id));

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addModAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const owned = await ownedChannel();
  if (!owned) return { error: "No tienes ningún canal." };
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { error: "Indica un nombre de usuario." };

  const userId = await addModerator(owned.channel.slug, username, owned.session.username);
  if (!userId) return { error: `No existe el usuario "${username}".` };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeModAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const owned = await ownedChannel();
  if (!owned) return { error: "No tienes ningún canal." };
  const username = String(formData.get("username") ?? "").trim();
  await removeModerator(owned.channel.slug, username);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Crea un canal para el usuario actual si aún no tiene ninguno. */
export async function createChannelAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  const existing = await getChannelByOwner(session.userId);
  if (existing) redirect("/dashboard");

  const slug = session.username.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24) || `canal${Date.now()}`;
  const db = await getDb();
  await db
    .insert(channels)
    .values({
      id: randomUUID(),
      slug,
      ownerUserId: session.userId,
      streamKey: slug,
      displayName: session.username,
      category: "Just Chatting",
      title: `¡Bienvenido al canal de ${session.username}!`,
      language: "Español",
      tags: ["Nuevo", "Comunidad"],
      hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(slug)}`,
      thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(slug)}/640/360`,
      baseViewers: 0,
      isLive: true,
      followers: 0,
      about: "Canal recién creado en StreamLive.",
    })
    .onConflictDoNothing();

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

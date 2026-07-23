import type { WebSocket, WebSocketServer } from "ws";
import type { ChatMessage, ClientEvent, Role, ServerEvent } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import {
  getChannelSettings,
  loadHistory,
  saveMessage,
  clearMessages,
  loadModeration,
  saveSanction,
  removeSanction,
  loadModerators,
  addModerator,
  removeModerator,
  isFollower,
  type Sanction,
} from "./chat-db";
import { createBus, type Bus } from "./bus";
import { logger } from "@/lib/logger";

/**
 * Servidor de chat en directo. Cada canal es una "sala". Soporta:
 *  - Identidad autenticada (leída de la cookie de sesión) o invitado.
 *  - Persistencia de mensajes e historial en la base de datos.
 *  - Moderación por canal (timeout/ban) para admins, dueños y moderadores.
 *  - Comandos: /me, /timeout, /ban, /unban, /slow, /clear, /mod, /unmod.
 *  - Rate-limiting anti-spam y modo lento.
 *
 * Los mensajes se propagan por un bus (in-memory o Redis) para poder escalar a
 * varias instancias. El contador de espectadores es local a cada instancia.
 */

interface Client extends WebSocket {
  session?: SessionUser | null;
  channel?: string;
  user?: string;
  color?: string;
  role?: Role;
  userId?: string | null;
  canModerate?: boolean;
  isOwner?: boolean;
  isChannelMod?: boolean;
  msgTimes?: number[];
}

const rooms = new Map<string, Set<Client>>();
const owners = new Map<string, string | null>();
const mods = new Map<string, Set<string>>();
const followersOnly = new Map<string, boolean>();
const bannedWords = new Map<string, string[]>();
const sanctions = new Map<string, Map<string, Sanction>>();
const slowMode = new Map<string, number>();
const lastUserMsg = new Map<string, number>();

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function censor(text: string, words: string[]): string {
  let out = text;
  for (const w of words) {
    if (w) out = out.replace(new RegExp(escapeRegex(w), "gi"), "***");
  }
  return out;
}

// Bus de eventos (in-memory o Redis). Entrega los eventos publicados a las salas
// locales de esta instancia.
let bus: Bus;
createBus().then((b) => {
  bus = b;
  bus.onMessage(deliverLocal);
});

const MAX_MESSAGE_LENGTH = 300;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 8;
const RATE_MIN_INTERVAL = 400;

const COLORS = [
  "#ff6ad5", "#8a6dff", "#00d1b2", "#ffb703", "#4cc9f0",
  "#f72585", "#43aa8b", "#f9844a", "#90be6d", "#577590",
];
let guestSeq = 0;

function colorFor(user: string): string {
  let hash = 0;
  for (let i = 0; i < user.length; i++) hash = (hash * 31 + user.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function send(client: Client, event: ServerEvent) {
  if (client.readyState === client.OPEN) client.send(JSON.stringify(event));
}

function systemError(client: Client, text: string) {
  send(client, { type: "system", text, level: "error" });
}

/** Entrega un evento a las conexiones locales de esta instancia. */
function deliverLocal(channel: string, event: ServerEvent) {
  const room = rooms.get(channel);
  if (!room) return;
  for (const client of room) send(client, event);
}

/** Publica un evento por el bus (Redis o memoria) → llega a todas las instancias. */
function publish(channel: string, event: ServerEvent) {
  if (bus) bus.publish(channel, event);
  else deliverLocal(channel, event);
}

function viewerCount(channel: string): number {
  return rooms.get(channel)?.size ?? 0;
}

function sanitizeName(name: string): string {
  return name.replace(/[^\w\-]/g, "").slice(0, 24);
}

async function join(client: Client, channel: string, guestName?: string) {
  leave(client);

  if (client.session) {
    client.user = client.session.username;
    client.color = client.session.color;
    client.role = client.session.role;
    client.userId = client.session.userId;
  } else {
    const name = sanitizeName(guestName ?? "") || `invitado${(++guestSeq).toString().padStart(3, "0")}`;
    client.user = name;
    client.color = colorFor(name);
    client.role = "viewer";
    client.userId = null;
  }

  client.channel = channel;
  client.msgTimes = [];

  if (!rooms.has(channel)) rooms.set(channel, new Set());
  rooms.get(channel)!.add(client);

  // Recarga ajustes y moderadores en cada conexión, para que los cambios hechos
  // desde el panel del creador se apliquen sin reiniciar el servidor.
  const settings = await getChannelSettings(channel);
  owners.set(channel, settings.ownerUserId);
  followersOnly.set(channel, settings.followersOnly);
  bannedWords.set(channel, settings.bannedWords);
  // Respeta un modo lento activado en caliente por comando; si no, usa el de ajustes.
  if (!slowMode.has(channel)) slowMode.set(channel, settings.slowModeDefault);
  mods.set(channel, await loadModerators(channel));
  if (!sanctions.has(channel)) {
    const map = new Map<string, Sanction>();
    for (const s of await loadModeration(channel)) map.set(s.targetUsername, s);
    sanctions.set(channel, map);
  }

  const owner = owners.get(channel) ?? null;
  const isOwner = !!client.userId && client.userId === owner;
  const isChannelMod = !!client.userId && (mods.get(channel)?.has(client.userId) ?? false);
  client.isOwner = isOwner;
  client.isChannelMod = isChannelMod;
  client.canModerate = client.role === "admin" || isOwner || isChannelMod;

  send(client, {
    type: "welcome",
    username: client.user,
    role: client.role,
    canModerate: !!client.canModerate,
  });
  send(client, { type: "history", messages: await loadHistory(channel) });
  deliverLocal(channel, { type: "viewers", count: viewerCount(channel) });
}

function leave(client: Client) {
  const channel = client.channel;
  if (!channel) return;
  const room = rooms.get(channel);
  if (room) {
    room.delete(client);
    if (room.size === 0) rooms.delete(channel);
    else deliverLocal(channel, { type: "viewers", count: viewerCount(channel) });
  }
  client.channel = undefined;
}

/** Devuelve true si el usuario está silenciado (limpia timeouts expirados). */
function isMuted(channel: string, username: string): Sanction | null {
  const map = sanctions.get(channel);
  const s = map?.get(username);
  if (!s) return null;
  if (s.type === "timeout" && s.untilTs && s.untilTs <= Date.now()) {
    map!.delete(username);
    void removeSanction(channel, username);
    return null;
  }
  return s;
}

function rateLimited(client: Client): boolean {
  const now = Date.now();
  const times = client.msgTimes ?? [];
  const recent = times.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length && now - recent[recent.length - 1] < RATE_MIN_INTERVAL) return true;
  if (recent.length >= RATE_MAX) return true;
  recent.push(now);
  client.msgTimes = recent;
  return false;
}

function makeMessage(client: Client, text: string, action = false): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user: client.user!,
    text,
    color: client.color!,
    role: client.role!,
    ts: Date.now(),
    action,
    // Badge MOD para moderadores de canal cuyo rol global es viewer.
    mod: client.isChannelMod && client.role === "viewer",
  };
}

async function handleChat(client: Client, rawText: string) {
  const channel = client.channel;
  if (!channel || !client.user) return;

  const text = rawText.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) return;

  const muted = isMuted(channel, client.user);
  if (muted) {
    systemError(
      client,
      muted.type === "ban"
        ? "Estás baneado de este chat."
        : "Estás en modo silencio temporal.",
    );
    return;
  }

  if (text.startsWith("/")) {
    await handleCommand(client, channel, text);
    return;
  }

  // Modo solo-seguidores (no aplica a moderadores).
  if (followersOnly.get(channel) && !client.canModerate) {
    const ok = client.userId ? await isFollower(client.userId, channel) : false;
    if (!ok) {
      systemError(client, "Solo los seguidores pueden escribir en este chat.");
      return;
    }
  }

  if (rateLimited(client)) {
    systemError(client, "Vas demasiado rápido, espera un momento.");
    return;
  }

  // Modo lento (no aplica a moderadores).
  const slow = slowMode.get(channel) ?? 0;
  if (slow > 0 && !client.canModerate) {
    const key = `${channel}:${client.user}`;
    const last = lastUserMsg.get(key) ?? 0;
    const wait = slow * 1000 - (Date.now() - last);
    if (wait > 0) {
      systemError(client, `Modo lento activo: espera ${Math.ceil(wait / 1000)}s.`);
      return;
    }
    lastUserMsg.set(key, Date.now());
  }

  const clean = censor(text, bannedWords.get(channel) ?? []);
  const message = makeMessage(client, clean);
  publish(channel, { type: "chat", message });
  void saveMessage(channel, message, client.userId ?? null);
}

async function handleCommand(client: Client, channel: string, text: string) {
  const [cmd, ...args] = text.slice(1).split(/\s+/);

  if (cmd === "me") {
    const body = args.join(" ").trim();
    if (!body) return;
    if (rateLimited(client)) return;
    const message = makeMessage(client, body, true);
    publish(channel, { type: "chat", message });
    void saveMessage(channel, message, client.userId ?? null);
    return;
  }

  // Gestión de moderadores: solo dueño del canal o admin.
  if (cmd === "mod" || cmd === "unmod") {
    if (!(client.isOwner || client.role === "admin")) {
      systemError(client, "Solo el dueño del canal puede gestionar moderadores.");
      return;
    }
    const target = sanitizeName(args[0] ?? "");
    if (!target) return systemError(client, `Uso: /${cmd} <usuario>`);
    const set = mods.get(channel) ?? new Set<string>();
    if (cmd === "mod") {
      const userId = await addModerator(channel, target, client.user!);
      if (!userId) return systemError(client, `No existe el usuario ${target}.`);
      set.add(userId);
      mods.set(channel, set);
      publish(channel, { type: "system", text: `🛡️ ${target} ahora es moderador (por ${client.user}).` });
    } else {
      const userId = await removeModerator(channel, target);
      if (userId) set.delete(userId);
      publish(channel, { type: "system", text: `${target} ya no es moderador.` });
    }
    // Recalcula permisos en caliente para las conexiones locales del canal.
    for (const c of rooms.get(channel) ?? []) {
      c.isChannelMod = !!c.userId && set.has(c.userId);
      c.canModerate = c.role === "admin" || !!c.isOwner || c.isChannelMod;
    }
    return;
  }

  const modCommands = ["timeout", "ban", "unban", "slow", "clear"];
  if (modCommands.includes(cmd)) {
    if (!client.canModerate) {
      systemError(client, "No tienes permisos de moderación en este canal.");
      return;
    }
    const map = sanctions.get(channel)!;
    switch (cmd) {
      case "timeout": {
        const target = sanitizeName(args[0] ?? "");
        const secs = Math.max(1, Math.min(86400, Number(args[1]) || 300));
        if (!target) return systemError(client, "Uso: /timeout <usuario> <segundos>");
        const s: Sanction = { targetUsername: target, type: "timeout", untilTs: Date.now() + secs * 1000 };
        map.set(target, s);
        void saveSanction(channel, s, client.user!);
        publish(channel, { type: "system", text: `⏳ ${target} silenciado ${secs}s por ${client.user}.` });
        return;
      }
      case "ban": {
        const target = sanitizeName(args[0] ?? "");
        if (!target) return systemError(client, "Uso: /ban <usuario>");
        const s: Sanction = { targetUsername: target, type: "ban", untilTs: null };
        map.set(target, s);
        void saveSanction(channel, s, client.user!);
        publish(channel, { type: "system", text: `🔨 ${target} ha sido baneado por ${client.user}.` });
        return;
      }
      case "unban": {
        const target = sanitizeName(args[0] ?? "");
        if (!target) return systemError(client, "Uso: /unban <usuario>");
        map.delete(target);
        void removeSanction(channel, target);
        publish(channel, { type: "system", text: `✅ ${target} ha sido readmitido.` });
        return;
      }
      case "slow": {
        const secs = Math.max(0, Math.min(300, Number(args[0]) || 0));
        slowMode.set(channel, secs);
        publish(channel, {
          type: "system",
          text: secs > 0 ? `🐌 Modo lento: 1 mensaje cada ${secs}s.` : "Modo lento desactivado.",
        });
        return;
      }
      case "clear": {
        void clearMessages(channel);
        publish(channel, { type: "clear" });
        publish(channel, { type: "system", text: `🧹 ${client.user} ha limpiado el chat.` });
        return;
      }
    }
  }

  systemError(client, `Comando desconocido: /${cmd}`);
}

export function attachChat(wss: WebSocketServer) {
  wss.on("connection", (ws: Client) => {
    ws.on("message", (data) => {
      let event: ClientEvent;
      try {
        event = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (event.type === "join") void join(ws, event.channel, event.guestName);
      else if (event.type === "chat") void handleChat(ws, event.text);
    });
    ws.on("close", () => leave(ws));
    ws.on("error", (err) => {
      logger.warn("Error en conexión de chat", { error: String(err) });
      leave(ws);
    });
  });
}

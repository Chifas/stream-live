import type { WebSocket, WebSocketServer } from "ws";
import type { ChatMessage, ClientEvent, ServerEvent } from "../lib/types";

/**
 * Lógica del chat en directo. Mantiene "salas" (una por canal) en memoria,
 * reenvía cada mensaje a los miembros de la sala y emite el contador de
 * espectadores en tiempo real.
 *
 * En producción esto se sustituiría por un backend con estado compartido
 * (Redis pub/sub) para poder escalar horizontalmente con varias instancias.
 */

interface Client extends WebSocket {
  channel?: string;
  user?: string;
  color?: string;
}

const rooms = new Map<string, Set<Client>>();
const history = new Map<string, ChatMessage[]>();
const HISTORY_LIMIT = 60;
const MAX_MESSAGE_LENGTH = 300;

const COLORS = [
  "#ff6ad5", "#8a6dff", "#00d1b2", "#ffb703", "#4cc9f0",
  "#f72585", "#43aa8b", "#f9844a", "#90be6d", "#577590",
];

function colorFor(user: string): string {
  let hash = 0;
  for (let i = 0; i < user.length; i++) hash = (hash * 31 + user.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function send(client: Client, event: ServerEvent) {
  if (client.readyState === client.OPEN) client.send(JSON.stringify(event));
}

function broadcast(channel: string, event: ServerEvent, except?: Client) {
  const room = rooms.get(channel);
  if (!room) return;
  for (const client of room) {
    if (client !== except) send(client, event);
  }
}

function viewerCount(channel: string): number {
  return rooms.get(channel)?.size ?? 0;
}

function join(client: Client, channel: string, user: string) {
  leave(client);
  client.channel = channel;
  client.user = user.slice(0, 24) || "invitado";
  client.color = colorFor(client.user);

  let room = rooms.get(channel);
  if (!room) {
    room = new Set();
    rooms.set(channel, room);
  }
  room.add(client);

  // Historial reciente al recién llegado.
  send(client, { type: "history", messages: history.get(channel) ?? [] });
  send(client, { type: "system", text: `Te has unido al chat de ${channel}.` });
  broadcast(channel, { type: "viewers", count: viewerCount(channel) });
}

function leave(client: Client) {
  const channel = client.channel;
  if (!channel) return;
  const room = rooms.get(channel);
  if (room) {
    room.delete(client);
    if (room.size === 0) rooms.delete(channel);
    else broadcast(channel, { type: "viewers", count: viewerCount(channel) });
  }
  client.channel = undefined;
}

function handleChat(client: Client, rawText: string) {
  const channel = client.channel;
  if (!channel || !client.user) return;
  const text = rawText.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) return;

  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user: client.user,
    text,
    color: client.color ?? "#ffffff",
    ts: Date.now(),
  };

  const log = history.get(channel) ?? [];
  log.push(message);
  if (log.length > HISTORY_LIMIT) log.shift();
  history.set(channel, log);

  broadcast(channel, { type: "chat", message });
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
      if (event.type === "join") join(ws, event.channel, event.user);
      else if (event.type === "chat") handleChat(ws, event.text);
    });

    ws.on("close", () => leave(ws));
    ws.on("error", () => leave(ws));
  });
}

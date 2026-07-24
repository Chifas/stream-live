export interface Channel {
  slug: string;
  displayName: string;
  category: string;
  title: string;
  language: string;
  tags: string[];
  hlsUrl: string;
  avatarUrl: string;
  thumbnailUrl: string;
  baseViewers: number;
  isLive: boolean;
  followers: number;
  about: string;
}

export interface Category {
  slug: string;
  name: string;
  coverUrl: string;
  viewers: number;
}

export type Role = "viewer" | "creator" | "admin";

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
  role: Role;
  ts: number;
  /** true si es un mensaje de acción (`/me`) */
  action?: boolean;
  /** true si el autor es moderador del canal (aunque su rol global sea viewer) */
  mod?: boolean;
}

/** Mensajes que el cliente envía al servidor de chat */
export type ClientEvent =
  | { type: "join"; channel: string; guestName?: string }
  | { type: "chat"; text: string };

/** Mensajes que el servidor envía al cliente */
export type ServerEvent =
  | { type: "welcome"; username: string; role: Role; canModerate: boolean; canManageMods: boolean }
  | { type: "history"; messages: ChatMessage[] }
  | { type: "chat"; message: ChatMessage }
  | { type: "system"; text: string; level?: "info" | "error" }
  | { type: "viewers"; count: number }
  | { type: "clear" };

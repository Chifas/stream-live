export interface Channel {
  /** Identificador legible usado en la URL: /channel/[slug] */
  slug: string;
  displayName: string;
  category: string;
  /** Título de la emisión en curso */
  title: string;
  language: string;
  tags: string[];
  /** URL del manifiesto HLS (.m3u8) que reproduce el player */
  hlsUrl: string;
  avatarUrl: string;
  thumbnailUrl: string;
  /** Espectadores base sembrados (el contador real lo da el WebSocket) */
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

/** Mensajes que el cliente envía al servidor de chat */
export type ClientEvent =
  | { type: "join"; channel: string; user: string }
  | { type: "chat"; text: string };

/** Mensajes que el servidor envía al cliente */
export type ServerEvent =
  | { type: "history"; messages: ChatMessage[] }
  | { type: "chat"; message: ChatMessage }
  | { type: "viewers"; count: number }
  | { type: "system"; text: string };

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
  ts: number;
}

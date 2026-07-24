"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, Role, ServerEvent } from "@/lib/types";
import { useT } from "@/i18n/client";
import { ShieldIcon } from "./icons";

const ADJ = ["Rápido", "Épico", "Sigiloso", "Neón", "Cósmico", "Salvaje", "Turbo", "Místico"];
const NOUN = ["Panda", "Dragon", "Halcon", "Zorro", "Buho", "Lobo", "Tigre", "Cuervo"];

function randomName(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}${n}${Math.floor(Math.random() * 90 + 10)}`;
}

function guestName(): string {
  if (typeof window === "undefined") return "invitado";
  let name = localStorage.getItem("sl_guest");
  if (!name) {
    name = randomName();
    localStorage.setItem("sl_guest", name);
  }
  return name;
}

type Item =
  | { kind: "msg"; msg: ChatMessage }
  | { kind: "sys"; id: string; text: string; level: "info" | "error" };

const BADGE: Record<Role, { label: string; cls: string } | null> = {
  admin: { label: "ADMIN", cls: "bg-live text-white" },
  creator: { label: "STREAMER", cls: "bg-brand text-white" },
  viewer: null,
};

type EmoteMap = Record<string, string>;

function MessageText({ text, me, emotes }: { text: string; me: string; emotes: EmoteMap }) {
  // Separamos por espacios (conservándolos) para detectar emotes y menciones.
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  return (
    <>
      {tokens.map((tok, i) => {
        if (emotes[tok]) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={emotes[tok]}
              alt={tok}
              title={tok}
              className="mx-0.5 inline-block h-6 w-auto align-middle"
              loading="lazy"
            />
          );
        }
        if (tok.startsWith("@") && tok.length > 1) {
          const mentioned = tok.slice(1).toLowerCase() === me.toLowerCase();
          return (
            <span
              key={i}
              className={`rounded px-0.5 ${mentioned ? "bg-brand/40 text-white" : "text-brand-2"}`}
            >
              {tok}
            </span>
          );
        }
        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}

export function Chat({ channel }: { channel: string }) {
  const t = useT();
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [me, setMe] = useState<{
    username: string;
    role: Role;
    canModerate: boolean;
    canManageMods: boolean;
  }>({ username: "invitado", role: "viewer", canModerate: false, canManageMods: false });
  const [emotes, setEmotes] = useState<EmoteMap>({});
  // Menú contextual al pulsar un nombre de usuario del chat.
  const [userMenu, setUserMenu] = useState<{ name: string; x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Emotes personalizados globales (7TV/BTTV/FFZ), cargados una vez.
  useEffect(() => {
    let active = true;
    fetch("/api/emotes")
      .then((r) => (r.ok ? r.json() : {}))
      .then((m: EmoteMap) => {
        if (active) setEmotes(m);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const attemptsRef = useRef(0);
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false;
    let retry: ReturnType<typeof setTimeout>;

    function connect() {
      if (closedRef.current) return;
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
      wsRef.current = ws;

      // Ignora eventos de sockets obsoletos (p. ej. el doble montaje de
      // StrictMode en desarrollo), que si no dejarían el estado "desconectado".
      const isActive = () => ws === wsRef.current;

      ws.onopen = () => {
        if (!isActive()) return;
        attemptsRef.current = 0;
        setConnected(true);
        ws.send(JSON.stringify({ type: "join", channel, guestName: guestName() }));
      };

      ws.onmessage = (evt) => {
        if (!isActive()) return;
        const data: ServerEvent = JSON.parse(evt.data);
        switch (data.type) {
          case "welcome":
            setMe({
              username: data.username,
              role: data.role,
              canModerate: data.canModerate,
              canManageMods: data.canManageMods,
            });
            break;
          case "history":
            setItems(data.messages.map((msg) => ({ kind: "msg", msg })));
            break;
          case "chat": {
            const item: Item = { kind: "msg", msg: data.message };
            setItems((prev) => [...prev, item].slice(-250));
            break;
          }
          case "system": {
            const item: Item = {
              kind: "sys",
              id: `${Date.now()}-${Math.random()}`,
              text: data.text,
              level: data.level ?? "info",
            };
            setItems((prev) => [...prev, item].slice(-250));
            break;
          }
          case "clear":
            setItems([]);
            break;
          case "viewers":
            window.dispatchEvent(new CustomEvent("sl:viewers", { detail: data.count }));
            break;
        }
      };

      ws.onclose = () => {
        if (!isActive()) return; // socket obsoleto: no togues el estado
        setConnected(false);
        if (closedRef.current) return;
        // Reconexión con backoff exponencial (máx. 30s).
        const delay = Math.min(30000, 1000 * 2 ** attemptsRef.current++);
        retry = setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      closedRef.current = true;
      clearTimeout(retry);
      wsRef.current?.close();
    };
  }, [channel]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [items]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "chat", text }));
    setInput("");
    atBottomRef.current = true;
  }

  /** Envía un comando de chat (p. ej. /ban usuario) sin tocar el input. */
  function sendCommand(text: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", text }));
      atBottomRef.current = true;
    }
    setUserMenu(null);
  }

  /** Inserta una mención @usuario en el input y enfoca. */
  function mention(name: string) {
    setInput((prev) => `${prev}@${name} `.replace(/^\s+/, ""));
    setUserMenu(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col bg-ink-2">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide">{t("chat.title")}</h3>
        <span className={`text-xs ${connected ? "text-green-400" : "text-muted"}`}>
          ● {connected ? t("chat.online") : t("chat.reconnecting")}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3 text-sm"
        aria-live="polite"
      >
        {items.length === 0 && (
          <p className="px-1 text-muted">{t("chat.empty")}</p>
        )}
        {items.map((it) =>
          it.kind === "sys" ? (
            <p
              key={it.id}
              className={`rounded px-2 py-1 text-xs ${
                it.level === "error" ? "bg-live/15 text-live" : "bg-ink-3 text-muted"
              }`}
            >
              {it.text}
            </p>
          ) : (
            <p
              key={it.msg.id}
              className="group/msg break-words rounded-md px-1.5 py-1 leading-snug transition-colors hover:bg-fg/[0.06]"
            >
              <span
                aria-hidden
                className="mr-1.5 inline-grid size-5 place-items-center rounded-full align-middle text-[10px] font-bold text-white"
                style={{ backgroundColor: it.msg.color }}
              >
                {it.msg.user.charAt(0).toUpperCase()}
              </span>
              {BADGE[it.msg.role] && (
                <span
                  className={`mr-1 align-middle rounded px-1 py-0.5 text-[10px] font-bold ${BADGE[it.msg.role]!.cls}`}
                >
                  {BADGE[it.msg.role]!.label}
                </span>
              )}
              {it.msg.mod && !BADGE[it.msg.role] && (
                <span className="mr-1 align-middle rounded bg-green-600 px-1 py-0.5 text-[10px] font-bold text-white">
                  MOD
                </span>
              )}
              <button
                type="button"
                onClick={(e) =>
                  setUserMenu({ name: it.msg.user, x: e.clientX, y: e.clientY })
                }
                className="font-semibold hover:underline"
                style={{ color: it.msg.color }}
              >
                {it.msg.user}
              </button>
              {it.msg.action ? (
                <span className="italic text-muted">
                  {" "}
                  <MessageText text={it.msg.text} me={me.username} emotes={emotes} />
                </span>
              ) : (
                <>
                  <span className="text-muted">: </span>
                  <MessageText text={it.msg.text} me={me.username} emotes={emotes} />
                </>
              )}
            </p>
          ),
        )}
      </div>

      {me.canModerate && (
        <p className="flex flex-wrap items-center gap-x-1 border-t border-edge px-3 py-1.5 text-[11px] text-muted">
          <ShieldIcon className="size-3.5" /> {t("chat.modHint")}: <code>/timeout usuario 60</code> · <code>/ban</code> ·{" "}
          <code>/slow 5</code> · <code>/clear</code> · <code>/mod usuario</code>
        </p>
      )}

      <form onSubmit={sendMessage} className="border-t border-edge p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            aria-label={t("chat.title")}
            placeholder={`${t("chat.placeholder")} ${me.username}`}
            className="min-w-0 flex-1 rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("chat.send")}
          </button>
        </div>
      </form>

      {/* Menú contextual del usuario del chat */}
      {userMenu && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setUserMenu(null)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="fixed z-50 w-52 overflow-hidden rounded-lg border border-edge bg-ink-2 py-1 text-sm shadow-xl"
            style={{
              left: Math.min(userMenu.x, (typeof window !== "undefined" ? window.innerWidth : 400) - 220),
              top: Math.min(userMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 260),
            }}
          >
            <div className="truncate border-b border-edge px-3 py-2 font-bold">
              {userMenu.name}
            </div>
            <button
              onClick={() => mention(userMenu.name)}
              className="block w-full px-3 py-2 text-left hover:bg-ink-3"
            >
              💬 Mencionar
            </button>

            {me.canModerate && userMenu.name !== me.username && (
              <div className="border-t border-edge">
                <button
                  onClick={() => sendCommand(`/timeout ${userMenu.name} 300`)}
                  className="block w-full px-3 py-2 text-left hover:bg-ink-3"
                >
                  ⏳ Silenciar 5 min
                </button>
                <button
                  onClick={() => sendCommand(`/timeout ${userMenu.name} 600`)}
                  className="block w-full px-3 py-2 text-left hover:bg-ink-3"
                >
                  ⏳ Silenciar 10 min
                </button>
                <button
                  onClick={() => sendCommand(`/ban ${userMenu.name}`)}
                  className="block w-full px-3 py-2 text-left text-live hover:bg-ink-3"
                >
                  🔨 Expulsar (ban)
                </button>
                <button
                  onClick={() => sendCommand(`/unban ${userMenu.name}`)}
                  className="block w-full px-3 py-2 text-left hover:bg-ink-3"
                >
                  ✅ Readmitir
                </button>
              </div>
            )}

            {me.canManageMods && userMenu.name !== me.username && (
              <div className="border-t border-edge">
                <button
                  onClick={() => sendCommand(`/mod ${userMenu.name}`)}
                  className="block w-full px-3 py-2 text-left hover:bg-ink-3"
                >
                  🛡️ Hacer moderador
                </button>
                <button
                  onClick={() => sendCommand(`/unmod ${userMenu.name}`)}
                  className="block w-full px-3 py-2 text-left hover:bg-ink-3"
                >
                  Quitar moderador
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

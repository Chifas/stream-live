"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, Role, ServerEvent } from "@/lib/types";

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

function MessageText({ text, me }: { text: string; me: string }) {
  const parts = useMemo(() => text.split(/(@\w+)/g), [text]);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("@") ? (
          <span
            key={i}
            className={`rounded px-0.5 ${
              p.slice(1).toLowerCase() === me.toLowerCase()
                ? "bg-brand/40 text-white"
                : "text-brand-2"
            }`}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function Chat({ channel }: { channel: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [me, setMe] = useState<{ username: string; role: Role; canModerate: boolean }>({
    username: "invitado",
    role: "viewer",
    canModerate: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const attemptsRef = useRef(0);
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false;

    function connect() {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptsRef.current = 0;
        setConnected(true);
        ws.send(JSON.stringify({ type: "join", channel, guestName: guestName() }));
      };

      ws.onmessage = (evt) => {
        const data: ServerEvent = JSON.parse(evt.data);
        switch (data.type) {
          case "welcome":
            setMe({ username: data.username, role: data.role, canModerate: data.canModerate });
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
        setConnected(false);
        if (closedRef.current) return;
        // Reconexión con backoff exponencial (máx. 30s).
        const delay = Math.min(30000, 1000 * 2 ** attemptsRef.current++);
        setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      closedRef.current = true;
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

  return (
    <div className="flex h-full flex-col bg-ink-2">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide">Chat del directo</h3>
        <span className={`text-xs ${connected ? "text-green-400" : "text-muted"}`}>
          ● {connected ? "en línea" : "reconectando…"}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3 text-sm"
        aria-live="polite"
      >
        {items.length === 0 && (
          <p className="px-1 text-muted">Sé el primero en escribir. ¡Saluda! 👋</p>
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
            <p key={it.msg.id} className="break-words leading-snug">
              {BADGE[it.msg.role] && (
                <span
                  className={`mr-1 rounded px-1 py-0.5 text-[10px] font-bold ${BADGE[it.msg.role]!.cls}`}
                >
                  {BADGE[it.msg.role]!.label}
                </span>
              )}
              <span className="font-semibold" style={{ color: it.msg.color }}>
                {it.msg.user}
              </span>
              {it.msg.action ? (
                <span className="italic text-muted">
                  {" "}
                  <MessageText text={it.msg.text} me={me.username} />
                </span>
              ) : (
                <>
                  <span className="text-muted">: </span>
                  <MessageText text={it.msg.text} me={me.username} />
                </>
              )}
            </p>
          ),
        )}
      </div>

      {me.canModerate && (
        <p className="border-t border-edge px-3 py-1.5 text-[11px] text-muted">
          🛡️ Moderación: <code>/timeout usuario 60</code> · <code>/ban</code> ·{" "}
          <code>/slow 5</code> · <code>/clear</code>
        </p>
      )}

      <form onSubmit={sendMessage} className="border-t border-edge p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            aria-label="Mensaje de chat"
            placeholder={`Enviar mensaje como ${me.username}`}
            className="min-w-0 flex-1 rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

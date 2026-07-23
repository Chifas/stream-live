"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ServerEvent } from "@/lib/types";

const ADJ = ["Rápido", "Épico", "Sigiloso", "Neón", "Cósmico", "Salvaje", "Turbo", "Místico"];
const NOUN = ["Panda", "Dragón", "Halcón", "Zorro", "Búho", "Lobo", "Tigre", "Cuervo"];

function randomName(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}${n}${Math.floor(Math.random() * 90 + 10)}`;
}

function getUsername(): string {
  if (typeof window === "undefined") return "invitado";
  let name = localStorage.getItem("sl_user");
  if (!name) {
    name = randomName();
    localStorage.setItem("sl_user", name);
  }
  return name;
}

export function Chat({ channel }: { channel: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState("invitado");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  useEffect(() => {
    const username = getUsername();
    setUser(username);

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", channel, user: username }));
    };
    ws.onclose = () => setConnected(false);
    ws.onmessage = (evt) => {
      const data: ServerEvent = JSON.parse(evt.data);
      if (data.type === "history") setMessages(data.messages);
      else if (data.type === "chat") setMessages((m) => [...m, data.message].slice(-200));
      // El evento "viewers" lo consume el contador de la página del canal.
      if (data.type === "viewers") {
        window.dispatchEvent(new CustomEvent("sl:viewers", { detail: data.count }));
      }
    };

    return () => ws.close();
  }, [channel]);

  // Autoscroll solo si el usuario ya estaba abajo.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "chat", text }));
    setInput("");
    atBottomRef.current = true;
  }

  return (
    <div className="flex h-full flex-col bg-ink-2">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide">Chat del directo</h3>
        <span
          className={`text-xs ${connected ? "text-green-400" : "text-muted"}`}
          title={connected ? "Conectado" : "Desconectado"}
        >
          ● {connected ? "en línea" : "conectando…"}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3 text-sm"
      >
        {messages.length === 0 && (
          <p className="px-1 text-muted">
            Sé el primero en escribir. ¡Saluda a la comunidad! 👋
          </p>
        )}
        {messages.map((m) => (
          <p key={m.id} className="break-words leading-snug">
            <span className="font-semibold" style={{ color: m.color }}>
              {m.user}
            </span>
            <span className="text-muted">: </span>
            <span>{m.text}</span>
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage} className="border-t border-edge p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            placeholder={`Enviar mensaje como ${user}`}
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

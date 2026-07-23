/**
 * Servidor personalizado: sirve la app de Next.js y, en el mismo puerto,
 * expone un servidor WebSocket en la ruta `/ws` para el chat en directo.
 *
 * Next.js (App Router) no soporta WebSockets dentro de route handlers, por eso
 * usamos un servidor HTTP propio y hacemos el `upgrade` manualmente.
 */
import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocketServer } from "ws";
import { attachChat } from "./src/server/chat";
import { readSessionCookie, verifySession } from "./src/lib/auth";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST ?? "localhost";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url ?? "/", true));
  });

  // Servidor WebSocket sin servidor propio: reutilizamos el HTTP de arriba.
  const wss = new WebSocketServer({ noServer: true });
  attachChat(wss);

  server.on("upgrade", async (req, socket, head) => {
    const { pathname } = parse(req.url ?? "/", true);
    if (pathname === "/ws") {
      // La cookie de sesión viaja en el handshake: autenticamos aquí.
      const token = readSessionCookie(req.headers.cookie);
      const session = await verifySession(token);
      wss.handleUpgrade(req, socket, head, (ws) => {
        (ws as unknown as { session: typeof session }).session = session;
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`\n  ▶  Stream Live listo en http://${hostname}:${port}`);
    console.log(`  💬  Chat WebSocket en ws://${hostname}:${port}/ws\n`);
  });
});

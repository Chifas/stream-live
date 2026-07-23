# ▶ StreamLive

Plataforma de **streaming en directo** (tipo Twitch) construida como demo full-stack
con tecnología moderna. Incluye listado de directos, página de canal con
**reproductor HLS** y **chat en tiempo real por WebSockets**.

![status](https://img.shields.io/badge/estado-demo%20funcional-9147ff)

## 🧱 Stack

| Área            | Tecnología                                             |
| --------------- | ------------------------------------------------------ |
| Framework       | **Next.js 15** (App Router, React Server Components)    |
| UI              | **React 19** + **TypeScript**                          |
| Estilos         | **Tailwind CSS v4** (con `@theme`)                     |
| Vídeo           | **hls.js** (HLS / LL-HLS, con fallback nativo Safari)  |
| Tiempo real     | **WebSockets** (`ws`) sobre un servidor Node propio    |
| Datos           | En memoria (sembrados), listos para migrar a una BD    |

## 🚀 Puesta en marcha

```bash
npm install
npm run dev
```

Abre **http://localhost:3000**.

Scripts disponibles:

```bash
npm run dev     # desarrollo con recarga en caliente
npm run build   # build de producción
npm start       # sirve el build de producción
```

## 🗂️ Arquitectura

```
server.ts                 Servidor Node: Next.js + WebSocket (/ws) en el mismo puerto
src/
  app/
    page.tsx              Home: hero + grid de directos + categorías
    browse/               Explorar categorías
    channel/[slug]/       Página de visionado: reproductor + info + chat
    studio/               Guía de emisión (RTMP/HLS)
  components/
    Player.tsx            Reproductor HLS (cliente)
    Chat.tsx              Chat en tiempo real (cliente, WebSocket)
    LiveViewers.tsx       Contador de espectadores en vivo
    ChannelCard.tsx / Navbar.tsx / Sidebar.tsx
  server/
    chat.ts               Lógica del chat: salas, historial, difusión
  lib/
    streams.ts            Datos sembrados de canales/categorías
    types.ts / format.ts
```

### ¿Cómo funciona el directo?

- El **vídeo** se reproduce desde manifiestos **HLS** (`.m3u8`). En esta demo se
  usan streams públicos de prueba para que funcione sin infraestructura. En
  producción, un media server (MediaMTX, nginx-rtmp, Livepeer…) recibe RTMP desde
  OBS y publica el HLS. Ver `/studio`.
- El **chat** viaja por un WebSocket con una sala por canal, historial reciente y
  contador de espectadores reales en tiempo real.

## 📌 Próximos pasos

Consulta [`MEJORAS.md`](./MEJORAS.md) para el listado de mejoras propuestas.

---

Hecho con Next.js. Los streams HLS son de dominio público (Mux / Apple test streams).

# ▶ StreamLive

Plataforma de **streaming en directo** (tipo Twitch) full-stack con tecnología
moderna: catálogo de directos, **reproductor HLS**, **chat en tiempo real con
moderación**, **autenticación** y **base de datos**.

![status](https://img.shields.io/badge/estado-demo%20funcional-9147ff)
![ci](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF)

## 🧱 Stack

| Área          | Tecnología                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | **Next.js 15** (App Router, RSC, Server Actions)        |
| UI            | **React 19** + **TypeScript** + **Tailwind CSS v4**     |
| Vídeo         | **hls.js** (HLS/LL-HLS, calidad, PiP, fullscreen)       |
| Tiempo real   | **WebSockets** (`ws`) sobre servidor Node propio        |
| Base de datos | **SQLite/libSQL** + **Drizzle ORM**                     |
| Auth          | Sesión **JWT** (`jose`) en cookie httpOnly + scrypt     |
| Calidad       | **Vitest**, **ESLint**, **Prettier**, **GitHub Actions**|

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env   # opcional: define AUTH_SECRET
npm run dev
```

Abre **http://localhost:3000**. La base de datos SQLite y los datos de demo se
crean solos en el primer arranque (`./data/stream.db`).

### Cuentas de demo

| Usuario      | Contraseña  | Rol      |
| ------------ | ----------- | -------- |
| `admin`      | `admin1234` | admin    |
| `streamer`   | `demo1234`  | creator (dueño de `nova_plays`) |
| `espectador` | `demo1234`  | viewer   |

## 📜 Scripts

```bash
npm run dev        # desarrollo con recarga en caliente
npm run build      # build de producción
npm start          # sirve el build de producción
npm run typecheck  # comprobación de tipos
npm test           # tests unitarios (Vitest)
npm run lint       # ESLint
npm run format     # Prettier
```

## ✨ Funcionalidades

- **Directos** con hero destacado, grid y categorías (datos en BD).
- **Reproductor HLS** con selector de calidad, Picture-in-Picture y pantalla completa.
- **Emisión en directo real** con **MediaMTX** + OBS (ver más abajo), con fallback
  automático a un stream de demo cuando no hay emisión.
- **Chat en tiempo real** con:
  - Identidad autenticada o invitado (leída de la cookie en el handshake WS).
  - Persistencia e historial en base de datos.
  - **Moderación** para admins y dueños del canal: `/timeout`, `/ban`, `/unban`, `/slow`, `/clear`.
  - `/me`, menciones (`@usuario`), badges por rol, **rate-limit** y **modo lento**.
  - **Emotes personalizados** (7TV/BTTV/FFZ): escribe el nombre del emote y se
    renderiza como imagen.
  - **Reconexión automática** con backoff exponencial.
- **Autenticación** real (registro/login, sesión JWT, roles).
- **Seguir** canales (persistente) + página **Siguiendo**.
- **Búsqueda** real de canales/categorías.
- **Tema claro/oscuro**, skeletons de carga, error boundaries, **SEO/Open Graph** dinámico por canal.

## 🗂️ Arquitectura

```
server.ts                 Next.js + WebSocket (/ws) en el mismo puerto; auth en el handshake
src/
  app/                    Rutas (home, browse, channel, search, following, login, studio)
    actions/              Server Actions (auth, follow)
  components/             Player, Chat, Navbar, Sidebar, FollowButton, ThemeToggle…
  server/                 Lógica del chat (salas, moderación) + acceso a BD del chat
  db/                     Esquema Drizzle, cliente libSQL, bootstrap y seed
  lib/                    queries, auth/session, users, follows, password, format, tipos
```

## 📡 Emitir en directo de verdad (OBS + MediaMTX)

1. Levanta el media server (incluido en `docker-compose.yml`):
   ```bash
   docker compose up --build
   ```
2. En **OBS** → Ajustes → Emisión → Servicio **Personalizado**:
   - **Servidor:** `rtmp://localhost:1935`
   - **Clave:** el `streamKey` del canal (para la demo, `nova_plays`).
   - En `/studio`, logueado como `streamer`, tienes estos datos listos para copiar.
3. Pulsa **Iniciar transmisión** y abre `/channel/nova_plays`: el reproductor pasa
   solo de la demo a tu **emisión real** (badge «● EMISIÓN REAL»).

> Sin cuentas ni claves externas: MediaMTX y OBS son gratuitos y locales.

## 🐳 Docker

```bash
docker compose up --build
```

Levanta la app (puerto 3000) **y MediaMTX** (RTMP 1935 · HLS 8888 · API 9997),
con un volumen persistente para la BD.

## 📌 Mejoras

Consulta [`MEJORAS.md`](./MEJORAS.md) para lo implementado y la hoja de ruta
(media server real, Redis, Stripe, OAuth, i18n, observabilidad, despliegue…).

---

Los streams HLS de demo son de dominio público (Mux / Apple test streams).

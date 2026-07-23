# 🚀 Posibles mejoras — StreamLive

Este documento recoge mejoras propuestas para llevar la demo a un producto real,
ordenadas por prioridad. La demo actual cubre: listado de directos, reproductor
HLS y chat en tiempo real por WebSockets, con datos sembrados en memoria.

---

## 1. Infraestructura de streaming real (lo más importante)

- [ ] **Media server de ingesta**: integrar [MediaMTX](https://github.com/bluenviron/mediamtx),
      `nginx-rtmp` o un servicio gestionado ([Livepeer](https://livepeer.org/),
      [Mux](https://mux.dev/), [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/))
      para recibir RTMP/SRT desde OBS y transcodificar a **HLS / LL-HLS**.
- [ ] **Baja latencia**: adoptar **LL-HLS** o **WebRTC** (WHIP/WHEP) para latencias
      de 1–3 s en lugar de los 10–20 s del HLS clásico.
- [ ] **Transcodificación adaptativa (ABR)**: generar varias calidades (1080p/720p/480p)
      y dejar que hls.js cambie según el ancho de banda.
- [ ] **DVR / grabación (VOD)**: guardar las emisiones y ofrecer repeticiones.
- [ ] **Miniaturas en vivo**: capturar frames del stream para las tarjetas del home.

## 2. Persistencia y backend

- [ ] Sustituir los datos en memoria por una **base de datos**:
      **PostgreSQL + Drizzle ORM** (o Prisma), con canales, usuarios, seguidores,
      categorías e historial de chat.
- [ ] **Redis Pub/Sub** para el chat, de modo que escale horizontalmente con varias
      instancias del servidor WebSocket detrás de un balanceador.
- [ ] **API tipada** con Server Actions / route handlers o **tRPC**.
- [ ] **Caché** de listados de directos (ISR / `revalidate`).

## 3. Autenticación y cuentas

- [ ] **Auth.js (NextAuth v5)** o Clerk: login con email/OAuth (Google, Discord, Twitch).
- [ ] Perfiles de usuario, canal propio, panel de creador real.
- [ ] Roles y permisos: espectador, moderador, creador, administrador.

## 4. Chat: funcionalidades y moderación

- [ ] **Persistencia** del historial y carga paginada al entrar.
- [ ] **Moderación**: baneos, timeouts, modo solo-seguidores, modo lento (slow mode),
      filtro de palabras y **rate limiting** por usuario (hoy no hay límite anti-spam).
- [ ] **Emotes / emojis** personalizados del canal y autocompletado.
- [ ] **Badges** (suscriptor, moderador, VIP) y menciones `@usuario`.
- [ ] **Reconexión automática** del WebSocket con backoff exponencial.
- [ ] Comandos (`/me`, `/clear`, encuestas, sorteos).

## 5. Monetización

- [ ] **Suscripciones** y **bits/propinas** (Stripe).
- [ ] Anuncios pre-roll / mid-roll opcionales.
- [ ] Panel de ingresos para creadores.

## 6. Descubrimiento y social

- [ ] **Búsqueda real** (canales, categorías, etiquetas) — hoy la barra es visual.
- [ ] Sistema de **seguir** funcional con notificaciones de "en directo".
- [ ] Recomendaciones personalizadas y "canales similares".
- [ ] **Clips** y compartir momentos.
- [ ] Raids / hosting entre canales.

## 7. Calidad, rendimiento y accesibilidad

- [ ] **Tests**: unitarios (Vitest), componentes (Testing Library) y E2E (Playwright).
- [ ] **ESLint + Prettier** y `typecheck` en CI (**GitHub Actions**).
- [ ] **Accesibilidad**: navegación por teclado en el reproductor, subtítulos (WebVTT),
      roles ARIA en el chat, contraste AA.
- [ ] **SEO / Open Graph** dinámico por canal (metadatos de "en directo").
- [ ] **Observabilidad**: Sentry (errores) + métricas de reproducción (rebuffering, QoE).
- [ ] **i18n** (español/inglés) con `next-intl`.

## 8. DevOps y despliegue

- [ ] **Dockerfile** + `docker-compose` (app + Postgres + Redis + media server).
- [ ] Despliegue: el servidor personalizado con WebSockets necesita un runtime Node
      persistente (Railway, Render, Fly.io, VPS) — **no** el runtime serverless por
      defecto de Vercel para la parte del WebSocket.
- [ ] CDN para los manifiestos HLS y los assets estáticos.
- [ ] Variables de entorno (`.env`) para URLs de ingesta, claves y BD.

## 9. Detalles de producto (rápidos)

- [ ] Selector de **calidad** y control de **latencia** en el reproductor.
- [ ] **Theater mode** / pantalla completa / picture-in-picture.
- [ ] Modo claro/oscuro (hoy es solo oscuro).
- [ ] Skeletons de carga y estados de error más ricos.
- [ ] Página de "canal offline" con últimas repeticiones.
- [ ] Migrar los `<img>` remotos a `next/image` optimizado con tu propio CDN.

---

### Deuda técnica conocida en la demo

- Los espectadores mostrados = base sembrada + conexiones reales al WebSocket (mezcla
  simulada/real, aceptable para demo).
- No hay rate limiting ni sanitización avanzada en el chat (solo recorte de longitud).
- Los thumbnails/avatares vienen de servicios externos de placeholder.
- Sin autenticación: el usuario del chat es un invitado aleatorio guardado en `localStorage`.

# 🚀 Mejoras — StreamLive

Estado del proyecto y hoja de ruta. Marcado ✅ lo ya implementado en el repo.

---

## ✅ Ya implementado

- ✅ **Base de datos** (SQLite/libSQL + Drizzle ORM): usuarios, canales, categorías,
  seguidores, mensajes y moderación, con bootstrap y seed automáticos.
- ✅ **Autenticación** real: registro/login (hash **scrypt**), sesión **JWT** en
  cookie httpOnly, roles (viewer/creator/admin).
- ✅ **Chat en tiempo real avanzado**:
  - ✅ Persistencia e historial en BD.
  - ✅ Identidad autenticada (cookie leída en el handshake WS) o invitado.
  - ✅ Moderación: `/timeout`, `/ban`, `/unban`, `/slow`, `/clear` (admins y dueños).
  - ✅ `/me`, menciones `@usuario`, badges por rol.
  - ✅ **Rate-limiting** anti-spam y **modo lento**.
  - ✅ **Reconexión** con backoff exponencial.
- ✅ **Seguir** canales (persistente) + página **Siguiendo**.
- ✅ **Búsqueda** real de canales/categorías.
- ✅ **Reproductor**: selector de calidad, Picture-in-Picture, pantalla completa.
- ✅ **Tema claro/oscuro**, **skeletons** de carga, **error boundaries**.
- ✅ **SEO / Open Graph** dinámico por canal (imagen OG generada).
- ✅ **Tests** (Vitest), **ESLint**, **Prettier**, **CI** (GitHub Actions).
- ✅ **Docker** + **docker-compose** + `.env.example`.

---

## 🔜 Pendiente (requiere infraestructura o TUS credenciales)

### 1. Infraestructura de streaming real
- [ ] **Media server de ingesta**: [MediaMTX](https://github.com/bluenviron/mediamtx),
      `nginx-rtmp` o gestionado ([Livepeer](https://livepeer.org/),
      [Mux](https://mux.dev/), [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/))
      para recibir RTMP/SRT desde OBS y transcodificar a HLS/LL-HLS.
- [ ] **Baja latencia** con LL-HLS o **WebRTC** (WHIP/WHEP).
- [ ] **ABR** (múltiples calidades) y **grabación/VOD** (repeticiones).
- [ ] **Miniaturas en vivo** capturadas del stream.

### 2. Escalado del backend
- [ ] **Redis Pub/Sub** para el chat con varias instancias tras un balanceador
      (hoy el estado de las salas es en memoria por instancia).
- [ ] Migrar la BD a **PostgreSQL** en producción (el esquema Drizzle ya es portable).
- [ ] Caché de listados (ISR / `revalidate`).

### 3. Autenticación social (requiere secrets de cada proveedor)
- [ ] **OAuth** con Google/Discord/Twitch vía **Auth.js (NextAuth v5)**.
- [ ] Verificación de email y recuperación de contraseña.

### 4. Monetización (requiere claves de Stripe)
- [ ] **Suscripciones**, **bits/propinas** y panel de ingresos (Stripe).
- [ ] Anuncios opcionales.

### 5. Chat / moderación (siguiente nivel)
- [ ] Lista de **moderadores** por canal (más allá de dueño/admin).
- [ ] **Emotes** personalizados y autocompletado.
- [ ] Comandos avanzados: encuestas, sorteos, modo solo-seguidores.

### 6. Descubrimiento y social
- [ ] Recomendaciones personalizadas y "canales similares".
- [ ] **Clips** y compartir momentos; raids/hosting entre canales.
- [ ] Notificaciones push de "en directo".

### 7. Calidad y operación
- [ ] **E2E con Playwright** (además de los unit tests actuales).
- [ ] **i18n** (español/inglés) con `next-intl`.
- [ ] **Observabilidad**: Sentry + métricas de reproducción (QoE, rebuffering) — requiere DSN.
- [ ] Accesibilidad AA completa (subtítulos WebVTT, auditoría de teclado).

### 8. Despliegue
- [ ] Hosting con runtime Node persistente (Railway, Render, Fly.io, VPS) — el
      WebSocket **no** funciona en el runtime serverless por defecto de Vercel.
- [ ] CDN para manifiestos HLS y assets; secretos vía variables de entorno.

---

### Deuda técnica conocida
- Espectadores mostrados = base sembrada + conexiones reales al WebSocket (mezcla simulada/real).
- Los vídeos son manifiestos HLS públicos de prueba (no hay ingesta real todavía).
- Thumbnails/avatares provienen de servicios externos de placeholder.
- Estado del chat en memoria por instancia (ver Redis en el punto 2).

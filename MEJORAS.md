# 🚀 Mejoras — StreamLive

Estado del proyecto y hoja de ruta. Marcado ✅ lo ya implementado en el repo.

---

## ✅ Ya implementado

- ✅ **Streaming en directo REAL** con **MediaMTX** (media server open-source, sin
  credenciales): OBS emite por RTMP → HLS → la web detecta el directo por la API
  de MediaMTX y lo reproduce; si no hay emisión, cae a un stream HLS de demo.
  Panel `/studio` con el servidor de ingesta y la clave de emisión del canal.
- ✅ **Emotes personalizados** en el chat vía **7TV / BTTV / FFZ** (API pública sin
  auth): los nombres de emote se renderizan como imágenes.
- ✅ **Panel del creador** (`/dashboard`, desde el menú de usuario): editar canal
  (título, categoría, idioma, etiquetas, descripción), **moderación automática**
  (modo lento por defecto, solo-seguidores, palabras prohibidas censuradas),
  gestión de **moderadores** y datos de OBS. Crear canal si no tienes uno.
- ✅ **Grabación / VOD**: MediaMTX graba las emisiones; página de repeticiones por
  canal con reproductor (se activa al haber grabaciones reales).
- ✅ **Accesibilidad**: foco visible, skip-link, `aria-label` en navegación y
  controles, categorías como enlaces, `aria-live` en el chat.
- ✅ **Tests E2E** con **Playwright** (home, canal, chat, búsqueda, login).
- ✅ **i18n español/inglés**: diccionarios, cookie de idioma, provider + selector
  (ES/EN) en la barra superior; UI principal traducida.
- ✅ **Base de datos** (SQLite/libSQL + Drizzle ORM): usuarios, canales, categorías,
  seguidores, mensajes y moderación, con bootstrap y seed automáticos.
- ✅ **Autenticación** real: registro/login (hash **scrypt**), sesión **JWT** en
  cookie httpOnly, roles (viewer/creator/admin).
- ✅ **Chat en tiempo real avanzado**:
  - ✅ Persistencia e historial en BD.
  - ✅ Identidad autenticada (cookie leída en el handshake WS) o invitado.
  - ✅ Moderación: `/timeout`, `/ban`, `/unban`, `/slow`, `/clear` (admins, dueños y mods).
  - ✅ **Moderadores por canal**: `/mod` y `/unmod` (dueño/admin), badge **MOD**.
  - ✅ `/me`, menciones `@usuario`, badges por rol.
  - ✅ **Rate-limiting** anti-spam y **modo lento**.
  - ✅ **Reconexión** con backoff exponencial.
- ✅ **Seguir** canales (persistente) + página **Siguiendo**.
- ✅ **Búsqueda** real de canales/categorías.
- ✅ **Reproductor**: selector de calidad, Picture-in-Picture, pantalla completa.
- ✅ **Tema claro/oscuro**, **skeletons** de carga, **error boundaries**.
- ✅ **SEO / Open Graph** dinámico por canal (imagen OG generada).
- ✅ **Escalado del chat**: bus de eventos con **Redis pub/sub** (o memoria por
  defecto) para propagar mensajes entre varias instancias.
- ✅ **Logging estructurado** local (niveles; JSON en producción).
- ✅ **Tests** (Vitest), **ESLint**, **Prettier**, **CI** (GitHub Actions).
- ✅ **Docker** + **docker-compose** (app + MediaMTX + Redis) + `.env.example`.

---

## 🔜 Pendiente (requiere infraestructura o TUS credenciales)

### 1. Infraestructura de streaming (mejoras sobre lo ya hecho)
- [x] ~~Media server de ingesta (MediaMTX, RTMP→HLS)~~ ✅ hecho.
- [ ] **Baja latencia** con LL-HLS o **WebRTC** (WHIP/WHEP) — MediaMTX ya expone WebRTC.
- [x] ~~Grabación/VOD (repeticiones)~~ ✅ hecho (MediaMTX record + playback).
- [ ] **ABR** (múltiples calidades de transcodificación).
- [ ] **Miniaturas en vivo** capturadas del stream.
- [ ] **Emotes nativos de Twitch** (primera parte) — requiere la API de Twitch
      (client-id/secret); los de 7TV/BTTV/FFZ ya funcionan.

### 2. Escalado del backend
- [x] ~~Redis Pub/Sub para el chat multi-instancia~~ ✅ hecho (contador de
      espectadores todavía local por instancia).
- [ ] Contador de espectadores agregado entre instancias (vía Redis).
- [ ] Migrar la BD a **PostgreSQL** en producción (el esquema Drizzle ya es portable).
- [ ] Caché de listados (ISR / `revalidate`).

### 3. Autenticación social (requiere secrets de cada proveedor)
- [ ] **OAuth** con Google/Discord/Twitch vía **Auth.js (NextAuth v5)**.
- [ ] Verificación de email y recuperación de contraseña.

### 4. Monetización (requiere claves de Stripe)
- [ ] **Suscripciones**, **bits/propinas** y panel de ingresos (Stripe).
- [ ] Anuncios opcionales.

### 5. Chat / moderación (siguiente nivel)
- [x] ~~Lista de moderadores por canal~~ ✅ hecho (`/mod`, `/unmod`).
- [ ] **Autocompletado** de emotes al escribir.
- [ ] Comandos avanzados: encuestas, sorteos, modo solo-seguidores.

### 6. Descubrimiento y social
- [ ] Recomendaciones personalizadas y "canales similares".
- [ ] **Clips** y compartir momentos; raids/hosting entre canales.
- [ ] Notificaciones push de "en directo".

### 7. Calidad y operación
- [x] ~~E2E con Playwright~~ ✅ hecho.
- [x] ~~Accesibilidad (foco, aria, landmarks)~~ ✅ base hecha; falta subtítulos WebVTT.
- [x] ~~i18n español/inglés~~ ✅ hecho (UI principal; ampliable con más claves).
- [ ] Traducir también las páginas secundarias (login, studio, following).
- [ ] **Observabilidad**: Sentry + métricas de reproducción (QoE, rebuffering) — requiere DSN.
- [ ] Subtítulos/captions (WebVTT) en el reproductor.

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

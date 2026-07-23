import type { Channel, Category } from "./types";

/**
 * Datos sembrados en memoria. En un proyecto real esto vendría de una base de
 * datos (Postgres + Drizzle/Prisma) y de un media server (RTMP/WebRTC) que
 * publica los manifiestos HLS. Aquí usamos streams HLS públicos de prueba para
 * que el reproductor funcione de inmediato sin infraestructura externa.
 */

// Manifiestos HLS públicos de prueba (bucle continuo, ideales para demo).
const TEST_HLS = [
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "https://test-streams.mux.dev/pts_shift/master.m3u8",
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
  "https://test-streams.mux.dev/tos_ismc/main.m3u8",
];

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
const thumb = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/360`;

export const CHANNELS: Channel[] = [
  {
    slug: "nova_plays",
    displayName: "NovaPlays",
    category: "Just Chatting",
    title: "☕ Charlando y planeando la semana — ¡pregúntame lo que quieras!",
    language: "Español",
    tags: ["Español", "IRL", "Comunidad"],
    hlsUrl: TEST_HLS[0],
    avatarUrl: avatar("nova"),
    thumbnailUrl: thumb("nova"),
    baseViewers: 4213,
    isLive: true,
    followers: 128400,
    about: "Streamer de variedades. Charlas, retos y buen rollo cada tarde.",
  },
  {
    slug: "pixel_forge",
    displayName: "PixelForge",
    category: "Desarrollo de Software",
    title: "🛠️ Construyendo un juego roguelike en Rust — en directo",
    language: "Español",
    tags: ["Programación", "Rust", "Gamedev"],
    hlsUrl: TEST_HLS[1],
    avatarUrl: avatar("pixel"),
    thumbnailUrl: thumb("pixel"),
    baseViewers: 1890,
    isLive: true,
    followers: 54300,
    about: "Programación en directo. Rust, gráficos y arquitectura de juegos.",
  },
  {
    slug: "aurora_beats",
    displayName: "AuroraBeats",
    category: "Música",
    title: "🎧 Lo-fi & synthwave en vivo | Set nocturno",
    language: "Español",
    tags: ["Música", "DJ", "Chill"],
    hlsUrl: TEST_HLS[2],
    avatarUrl: avatar("aurora"),
    thumbnailUrl: thumb("aurora"),
    baseViewers: 3120,
    isLive: true,
    followers: 89100,
    about: "Sesiones de música electrónica y ambiente para trabajar o relajarte.",
  },
  {
    slug: "raptor_fps",
    displayName: "RaptorFPS",
    category: "FPS Competitivo",
    title: "🔫 Ranked hasta Radiante — ¡vamos a por ello!",
    language: "Español",
    tags: ["Shooter", "Competitivo", "Ranked"],
    hlsUrl: TEST_HLS[3],
    avatarUrl: avatar("raptor"),
    thumbnailUrl: thumb("raptor"),
    baseViewers: 7640,
    isLive: true,
    followers: 302700,
    about: "Shooters competitivos al máximo nivel. Guías, clips y ranked diario.",
  },
  {
    slug: "chef_lumen",
    displayName: "ChefLumen",
    category: "Cocina",
    title: "🍜 Ramen casero desde cero — cocina en directo",
    language: "Español",
    tags: ["Cocina", "IRL", "Tutorial"],
    hlsUrl: TEST_HLS[0],
    avatarUrl: avatar("lumen"),
    thumbnailUrl: thumb("lumen"),
    baseViewers: 980,
    isLive: true,
    followers: 41200,
    about: "Recetas del mundo explicadas paso a paso, en directo y sin prisa.",
  },
  {
    slug: "orbit_racing",
    displayName: "OrbitRacing",
    category: "Simuladores",
    title: "🏎️ GT3 en Spa — persiguiendo la vuelta perfecta",
    language: "Español",
    tags: ["Racing", "Simulación", "Volante"],
    hlsUrl: TEST_HLS[1],
    avatarUrl: avatar("orbit"),
    thumbnailUrl: thumb("orbit"),
    baseViewers: 2450,
    isLive: true,
    followers: 76800,
    about: "Simracing serio: setups, telemetría y carreras de resistencia.",
  },
  {
    slug: "mystic_rpg",
    displayName: "MysticRPG",
    category: "RPG",
    title: "🗡️ Nueva partida de un JRPG clásico — historia completa",
    language: "Español",
    tags: ["RPG", "Historia", "Relax"],
    hlsUrl: TEST_HLS[2],
    avatarUrl: avatar("mystic"),
    thumbnailUrl: thumb("mystic"),
    baseViewers: 1330,
    isLive: true,
    followers: 63500,
    about: "Aventuras de rol narradas con calma. Lore, decisiones y comunidad.",
  },
  {
    slug: "studio_arte",
    displayName: "StudioArte",
    category: "Arte Digital",
    title: "🎨 Ilustrando un fanart en directo — proceso completo",
    language: "Español",
    tags: ["Arte", "Ilustración", "Creativo"],
    hlsUrl: TEST_HLS[3],
    avatarUrl: avatar("studio"),
    thumbnailUrl: thumb("studio"),
    baseViewers: 1720,
    isLive: true,
    followers: 58900,
    about: "Ilustración digital de principio a fin. Consejos y directo relajado.",
  },
];

export const CATEGORIES: Category[] = [
  { slug: "just-chatting", name: "Just Chatting", coverUrl: thumb("cat-chat"), viewers: 342000 },
  { slug: "fps", name: "FPS Competitivo", coverUrl: thumb("cat-fps"), viewers: 210500 },
  { slug: "musica", name: "Música", coverUrl: thumb("cat-music"), viewers: 98700 },
  { slug: "desarrollo", name: "Desarrollo de Software", coverUrl: thumb("cat-dev"), viewers: 45300 },
  { slug: "rpg", name: "RPG", coverUrl: thumb("cat-rpg"), viewers: 132400 },
  { slug: "simuladores", name: "Simuladores", coverUrl: thumb("cat-sim"), viewers: 67100 },
  { slug: "cocina", name: "Cocina", coverUrl: thumb("cat-food"), viewers: 28900 },
  { slug: "arte", name: "Arte Digital", coverUrl: thumb("cat-art"), viewers: 39600 },
];

export function getChannel(slug: string): Channel | undefined {
  return CHANNELS.find((c) => c.slug === slug);
}

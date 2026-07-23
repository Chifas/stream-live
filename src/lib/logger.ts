/**
 * Logger mínimo sin dependencias. En producción emite JSON por línea (apto para
 * agregadores); en desarrollo, texto legible. Sustituye a los `console.*` sueltos.
 */
type Level = "debug" | "info" | "warn" | "error";

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN = ORDER[(process.env.LOG_LEVEL as Level) ?? "info"] ?? 20;
const isProd = process.env.NODE_ENV === "production";

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (ORDER[level] < MIN) return;
  const time = new Date().toISOString();
  if (isProd) {
    process.stdout.write(JSON.stringify({ time, level, msg, ...meta }) + "\n");
  } else {
    const tag = { debug: "·", info: "▶", warn: "⚠", error: "✖" }[level];
    const extra = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    console.log(`${tag} ${msg}${extra}`);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};

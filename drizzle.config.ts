import { defineConfig } from "drizzle-kit";

/**
 * Configuración de Drizzle Kit para generar migraciones a partir del esquema.
 * El esquema se crea automáticamente al arrancar (ver src/db/client.ts), pero
 * en producción es recomendable versionar migraciones con `drizzle-kit generate`.
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/stream.db",
  },
});

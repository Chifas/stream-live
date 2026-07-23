# --- Etapa de build ---
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etapa de runtime ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/src ./src

# Persistencia de la base de datos SQLite.
VOLUME ["/app/data"]
EXPOSE 3000
ENV HOST=0.0.0.0 PORT=3000
CMD ["npm", "start"]

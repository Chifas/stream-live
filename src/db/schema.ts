import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

/** Usuarios registrados. La contraseña se guarda como hash scrypt (sal:hash). */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["viewer", "creator", "admin"] })
    .notNull()
    .default("viewer"),
  color: text("color").notNull().default("#a970ff"),
  createdAt: integer("created_at").notNull(),
});

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  ownerUserId: text("owner_user_id"),
  /** Clave de emisión para el media server (RTMP/HLS). */
  streamKey: text("stream_key"),
  displayName: text("display_name").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  language: text("language").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  hlsUrl: text("hls_url").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  baseViewers: integer("base_viewers").notNull().default(0),
  isLive: integer("is_live", { mode: "boolean" }).notNull().default(true),
  followers: integer("followers").notNull().default(0),
  about: text("about").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  coverUrl: text("cover_url").notNull(),
  viewers: integer("viewers").notNull().default(0),
});

export const follows = sqliteTable(
  "follows",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    channelSlug: text("channel_slug").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("follows_user_channel").on(t.userId, t.channelSlug),
  }),
);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  channelSlug: text("channel_slug").notNull(),
  userId: text("user_id"),
  username: text("username").notNull(),
  color: text("color").notNull(),
  text: text("text").notNull(),
  role: text("role").notNull().default("viewer"),
  ts: integer("ts").notNull(),
});

/** Moderadores por canal (usuarios registrados con permisos en un canal). */
export const moderators = sqliteTable(
  "moderators",
  {
    id: text("id").primaryKey(),
    channelSlug: text("channel_slug").notNull(),
    userId: text("user_id").notNull(),
    username: text("username").notNull(),
    addedBy: text("added_by").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("moderators_channel_user").on(t.channelSlug, t.userId),
  }),
);

/** Sanciones de moderación por canal (timeout temporal o ban permanente). */
export const moderation = sqliteTable("moderation", {
  id: text("id").primaryKey(),
  channelSlug: text("channel_slug").notNull(),
  targetUsername: text("target_username").notNull(),
  type: text("type", { enum: ["timeout", "ban"] }).notNull(),
  untilTs: integer("until_ts"),
  byUsername: text("by_username").notNull(),
  createdAt: integer("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type Category = typeof categories.$inferSelect;

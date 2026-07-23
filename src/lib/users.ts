import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, type User } from "@/db/schema";
import { hashPassword } from "./password";

const COLORS = [
  "#ff6ad5", "#8a6dff", "#00d1b2", "#ffb703", "#4cc9f0",
  "#f72585", "#43aa8b", "#f9844a", "#90be6d", "#577590",
];

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);
  return rows[0];
}

export async function createUser(username: string, password: string): Promise<User> {
  const db = await getDb();
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const user: User = {
    id: randomUUID(),
    username: username.toLowerCase(),
    passwordHash: await hashPassword(password),
    role: "viewer",
    color,
    createdAt: Date.now(),
  };
  await db.insert(users).values(user);
  return user;
}

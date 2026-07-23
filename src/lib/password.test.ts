import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifica la contraseña correcta", async () => {
    const hash = await hashPassword("secreto123");
    expect(await verifyPassword("secreto123", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("secreto123");
    expect(await verifyPassword("otra", hash)).toBe(false);
  });

  it("genera hashes distintos por la sal aleatoria", async () => {
    const a = await hashPassword("misma");
    const b = await hashPassword("misma");
    expect(a).not.toBe(b);
  });
});

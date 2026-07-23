import { describe, it, expect } from "vitest";
import { signSession, verifySession, readSessionCookie, SESSION_COOKIE } from "./auth";

const user = { userId: "u1", username: "ada", role: "creator" as const, color: "#fff" };

describe("session JWT", () => {
  it("firma y verifica una sesión válida", async () => {
    const token = await signSession(user);
    const session = await verifySession(token);
    expect(session).toMatchObject({ userId: "u1", username: "ada", role: "creator" });
  });

  it("rechaza un token manipulado", async () => {
    const token = await signSession(user);
    expect(await verifySession(token + "x")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });

  it("extrae la cookie de sesión de la cabecera", () => {
    const header = `foo=1; ${SESSION_COOKIE}=abc.def.ghi; bar=2`;
    expect(readSessionCookie(header)).toBe("abc.def.ghi");
    expect(readSessionCookie(undefined)).toBeUndefined();
  });
});

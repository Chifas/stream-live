import { test, expect } from "@playwright/test";

test.describe("StreamLive smoke", () => {
  test("la home muestra directos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Directos populares" })).toBeVisible();
    // Debe haber tarjetas de canal enlazando a /channel/*
    await expect(page.locator('a[href^="/channel/"]').first()).toBeVisible();
  });

  test("la página de canal tiene reproductor y chat", async ({ page }) => {
    await page.goto("/channel/nova_plays");
    await expect(page.locator("video")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chat del directo" })).toBeVisible();
  });

  test("el chat conecta y permite enviar como invitado", async ({ page }) => {
    await page.goto("/channel/nova_plays");
    // Espera a que el WebSocket esté conectado antes de enviar.
    await expect(page.getByText("en línea")).toBeVisible({ timeout: 15_000 });
    const input = page.getByPlaceholder(/Enviar mensaje como/);
    await expect(input).toBeVisible();
    const texto = `hola e2e ${Date.now()}`;
    await input.fill(texto);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(texto)).toBeVisible();
  });

  test("la búsqueda devuelve resultados", async ({ page }) => {
    await page.goto("/search?q=rust");
    await expect(page.getByText(/resultado/)).toBeVisible();
    // El resultado enlaza al canal de PixelForge (dentro del contenido principal).
    await expect(page.locator('main a[href="/channel/pixel_forge"]').first()).toBeVisible();
  });

  test("el login muestra el formulario", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

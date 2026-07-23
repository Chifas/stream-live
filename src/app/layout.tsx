import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { getMessages } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Stream Live — Directos para todos",
  description:
    "Plataforma de streaming en directo tipo Twitch construida con Next.js 15, React 19, Tailwind v4 y chat en tiempo real por WebSockets.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Aplica el tema antes de pintar para evitar parpadeo. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('sl_theme')||'dark';document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-ink text-fg">
        <I18nProvider locale={locale} messages={messages}>
          <a href="#contenido" className="skip-link">
            {locale === "en" ? "Skip to content" : "Saltar al contenido"}
          </a>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main id="contenido" className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

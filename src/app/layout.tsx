import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Stream Live — Directos para todos",
  description:
    "Plataforma de streaming en directo tipo Twitch construida con Next.js 15, React 19, Tailwind v4 y chat en tiempo real por WebSockets.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ink text-[#efeff1]">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

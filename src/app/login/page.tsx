import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PlayIcon } from "@/components/icons";

export const metadata = { title: "Entrar — StreamLive" };
export const dynamic = "force-dynamic";

const DEMO = [
  ["admin", "admin1234"],
  ["streamer", "demo1234"],
  ["espectador", "demo1234"],
];

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black">
            <span className="btn-brand grid size-9 place-items-center rounded-lg shadow-none">
              <PlayIcon className="size-5" />
            </span>
            Stream<span className="-ml-2 text-brand-2">Live</span>
          </Link>
          <p className="mt-2 text-pretty text-sm text-muted">
            Entra para seguir canales, chatear y emitir en directo.
          </p>
        </div>

        <div className="glow-brand rounded-xl2">
          <AuthForm />
        </div>

        <div className="mt-4 rounded-xl2 border border-edge bg-ink-2 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            Cuentas de demo
          </p>
          <div className="space-y-1.5">
            {DEMO.map(([u, p]) => (
              <div key={u} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold">{u}</span>
                <code className="rounded bg-ink-3 px-2 py-0.5 text-xs text-brand-2">{p}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

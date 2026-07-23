import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Entrar — StreamLive" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-2xl font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand">▶</span>
          Stream<span className="-ml-2 text-brand-2">Live</span>
        </Link>
        <AuthForm />
        <div className="mt-4 rounded-lg border border-edge bg-ink-2 p-3 text-xs text-muted">
          <p className="font-semibold text-white">Cuentas de demo:</p>
          <p>admin / admin1234 · streamer / demo1234 · espectador / demo1234</p>
        </div>
      </div>
    </div>
  );
}

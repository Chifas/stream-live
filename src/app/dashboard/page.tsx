import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getChannelByOwner, getModeratorUsernames } from "@/lib/queries";
import { ingestUrl, isPathLive } from "@/lib/mediamtx";
import { createChannelAction } from "@/app/actions/channel";
import { ChannelSettingsForm } from "@/components/dashboard/ChannelSettingsForm";
import { ModerationSettingsForm } from "@/components/dashboard/ModerationSettingsForm";
import { ModeratorsManager } from "@/components/dashboard/ModeratorsManager";
import { CopyField } from "@/components/CopyField";
import { formatViewers } from "@/lib/format";

export const metadata = { title: "Panel del creador — StreamLive" };
export const dynamic = "force-dynamic";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-edge bg-ink-2 p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const channel = await getChannelByOwner(session.userId);

  if (!channel) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-black">Panel del creador</h1>
        <div className="mt-6 rounded-xl border border-edge bg-ink-2 p-6 text-center">
          <p className="text-muted">Todavía no tienes un canal. Crea el tuyo para empezar a configurarlo.</p>
          <form action={createChannelAction} className="mt-4">
            <button className="rounded-md bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-2">
              Crear mi canal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [live, moderators] = await Promise.all([
    isPathLive(channel.streamKey),
    getModeratorUsernames(channel.slug),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Panel del creador</h1>
          <p className="text-muted">
            Canal:{" "}
            <Link href={`/channel/${channel.slug}`} className="font-semibold text-brand-2 hover:underline">
              {channel.displayName}
            </Link>
          </p>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-bold ${live ? "bg-live text-white" : "bg-ink-3 text-muted"}`}
        >
          {live ? "● EN DIRECTO" : "SIN EMISIÓN"}
        </span>
      </div>

      {/* Resumen */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Seguidores", v: formatViewers(channel.followers) },
          { k: "Espectadores base", v: formatViewers(channel.baseViewers) },
          { k: "Categoría", v: channel.category },
          { k: "Moderadores", v: String(moderators.length) },
        ].map((s) => (
          <div key={s.k} className="rounded-lg border border-edge bg-ink-2 p-3">
            <p className="text-xs text-muted">{s.k}</p>
            <p className="truncate text-lg font-bold">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Link href={`/channel/${channel.slug}`} className="rounded-md bg-ink-3 px-3 py-1.5 text-sm hover:bg-edge">
          Ver mi canal
        </Link>
        <Link href={`/channel/${channel.slug}/about`} className="rounded-md bg-ink-3 px-3 py-1.5 text-sm hover:bg-edge">
          Sobre el canal / tráiler
        </Link>
        <Link href={`/channel/${channel.slug}/vod`} className="rounded-md bg-ink-3 px-3 py-1.5 text-sm hover:bg-edge">
          Repeticiones
        </Link>
      </div>

      <div className="space-y-6">
        <Section title="Información del canal" desc="Título, categoría, idioma, etiquetas y descripción.">
          <ChannelSettingsForm channel={channel} />
        </Section>

        <Section
          title="Moderación automática"
          desc="Reglas que se aplican solas en tu chat en cuanto alguien entra."
        >
          <ModerationSettingsForm channel={channel} />
        </Section>

        <Section title="Moderadores" desc="Usuarios que pueden usar los comandos de moderación en tu canal.">
          <ModeratorsManager moderators={moderators} />
        </Section>

        <Section title="Emitir con OBS" desc="Conecta OBS a MediaMTX (Servicio: Personalizado).">
          <div className="space-y-3">
            <CopyField label="Servidor" value={ingestUrl()} />
            <CopyField label="Clave de retransmisión" value={channel.streamKey ?? channel.slug} secret />
          </div>
        </Section>
      </div>
    </div>
  );
}

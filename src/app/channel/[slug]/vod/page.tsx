import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChannel } from "@/lib/queries";
import { listRecordings } from "@/lib/mediamtx";
import { VodList } from "@/components/VodList";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const channel = await getChannel(slug);
  return { title: channel ? `Repeticiones de ${channel.displayName}` : "Repeticiones" };
}

export default async function VodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channel = await getChannel(slug);
  if (!channel) notFound();

  const recordings = await listRecordings(channel.streamKey);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Repeticiones de {channel.displayName}</h1>
        <Link
          href={`/channel/${channel.slug}`}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-2"
        >
          Ver directo
        </Link>
      </div>

      {recordings.length > 0 ? (
        <VodList recordings={recordings} />
      ) : (
        <div className="rounded-lg border border-edge bg-ink-2 p-8 text-center text-muted">
          <p>Este canal todavía no tiene repeticiones.</p>
          <p className="mt-2 text-sm">
            Las grabaciones aparecen aquí automáticamente cuando el canal emite con
            MediaMTX (grabación activada en <code>mediamtx.yml</code>).
          </p>
        </div>
      )}
    </div>
  );
}

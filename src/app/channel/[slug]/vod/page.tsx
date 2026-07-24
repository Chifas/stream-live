import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChannel } from "@/lib/queries";
import { listRecordings } from "@/lib/mediamtx";
import { VodList } from "@/components/VodList";
import { ChannelTabs } from "@/components/ChannelTabs";

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
      <div className="mb-4 flex items-center gap-3">
        <Image
          src={channel.avatarUrl}
          alt={channel.displayName}
          width={40}
          height={40}
          unoptimized
          className="size-10 rounded-full bg-ink-3 ring-2 ring-brand"
        />
        <h1 className="text-xl font-black">{channel.displayName}</h1>
      </div>
      <div className="mb-6">
        <ChannelTabs slug={channel.slug} active="vod" />
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

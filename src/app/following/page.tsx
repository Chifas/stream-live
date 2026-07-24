import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getFollowedChannels } from "@/lib/queries";
import { ChannelCard } from "@/components/ChannelCard";

export const metadata = { title: "Siguiendo — StreamLive" };
export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const channels = await getFollowedChannels(session.userId);

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-black">Canales que sigues</h1>
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((c) => (
            <ChannelCard key={c.slug} channel={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-edge bg-ink-2 p-8 text-center">
          <p className="text-muted">Todavía no sigues ningún canal.</p>
          <Link
            href="/"
            className="btn-brand mt-4 inline-block rounded-md px-4 py-2 text-sm font-semibold"
          >
            Descubrir directos
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowAction } from "@/app/actions/follow";
import { useT } from "@/i18n/client";

export function FollowButton({
  slug,
  initialFollowing,
}: {
  slug: string;
  initialFollowing: boolean;
}) {
  const t = useT();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      const res = await toggleFollowAction(slug);
      if (res.needsAuth) {
        router.push("/login");
        return;
      }
      setFollowing(res.following);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={following}
      className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        following
          ? "bg-ink-3 text-white hover:bg-edge"
          : "bg-brand text-white hover:bg-brand-2"
      }`}
    >
      {following ? `♥ ${t("channel.following")}` : `♡ ${t("channel.follow")}`}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSubscribeAction } from "@/app/actions/subscribe";
import { StarIcon } from "./icons";

export function SubscribeButton({
  slug,
  initialSubscribed,
}: {
  slug: string;
  initialSubscribed: boolean;
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      const res = await toggleSubscribeAction(slug);
      if (res.needsAuth) {
        router.push("/login");
        return;
      }
      setSubscribed(res.subscribed);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={subscribed}
      title="Suscripción gratuita en la demo"
      className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        subscribed ? "bg-ink-3 text-fg hover:bg-edge" : "btn-brand"
      }`}
    >
      <StarIcon className="size-4" />
      {subscribed ? "Suscrito" : "Suscribirse"}
    </button>
  );
}

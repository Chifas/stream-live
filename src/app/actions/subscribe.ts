"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { isSubscribed, subscribe, unsubscribe } from "@/lib/subscriptions";

export interface SubResult {
  subscribed: boolean;
  needsAuth?: boolean;
}

/** Suscripción gratuita (demo). En producción iría tras un pago (Stripe). */
export async function toggleSubscribeAction(slug: string): Promise<SubResult> {
  const session = await getSession();
  if (!session) return { subscribed: false, needsAuth: true };

  const already = await isSubscribed(session.userId, slug);
  if (already) await unsubscribe(session.userId, slug);
  else await subscribe(session.userId, session.username, slug);

  revalidatePath(`/channel/${slug}`);
  return { subscribed: !already };
}

"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { isFollowing } from "@/lib/queries";
import { followChannel, unfollowChannel } from "@/lib/follows";

export interface FollowResult {
  following: boolean;
  needsAuth?: boolean;
}

export async function toggleFollowAction(slug: string): Promise<FollowResult> {
  const session = await getSession();
  if (!session) return { following: false, needsAuth: true };

  const already = await isFollowing(session.userId, slug);
  if (already) await unfollowChannel(session.userId, slug);
  else await followChannel(session.userId, slug);

  revalidatePath(`/channel/${slug}`);
  revalidatePath("/following");
  return { following: !already };
}

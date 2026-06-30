"use server";

import { revalidatePath } from "next/cache";
import type { WatchStatus } from "@prisma/client";

import { auth } from "@/auth";
import { watchlistUpdateSchema } from "@/lib/validation";
import {
  addToWatchlist,
  ensureTitleCached,
  removeFromWatchlist,
  updateEntry,
} from "@/lib/watchlist";

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}

function revalidateFor(animeId: number) {
  revalidatePath("/library");
  revalidatePath("/me");
  revalidatePath(`/anime/${animeId}`);
}

export async function addToWatchlistAction(
  animeId: number,
  status: WatchStatus = "PLAN_TO_WATCH",
) {
  const userId = await requireUserId();
  await addToWatchlist(userId, animeId, status);
  revalidateFor(animeId);
  return { ok: true as const };
}

export async function updateEntryAction(input: unknown) {
  const userId = await requireUserId();
  const { titleId, ...patch } = watchlistUpdateSchema.parse(input);

  // Authoritative progress clamp: you can't have watched more episodes than
  // exist. The client also clamps, but ongoing shows (e.g. One Piece) report no
  // fixed total, so we re-derive the real ceiling here and refresh the cache.
  if (patch.progress != null) {
    const title = await ensureTitleCached(titleId);
    const cap = title?.episodes ?? null;
    patch.progress =
      cap != null ? Math.min(patch.progress, cap) : Math.max(0, patch.progress);
  }

  await updateEntry(userId, titleId, patch);
  revalidateFor(titleId);
  return { ok: true as const };
}

export async function removeEntryAction(titleId: number) {
  const userId = await requireUserId();
  await removeFromWatchlist(userId, titleId);
  revalidateFor(titleId);
  return { ok: true as const };
}

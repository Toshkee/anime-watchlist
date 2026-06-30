"use server";

import { revalidatePath } from "next/cache";
import type { WatchStatus } from "@prisma/client";

import { auth } from "@/auth";
import { watchlistUpdateSchema } from "@/lib/validation";
import {
  addToWatchlist,
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

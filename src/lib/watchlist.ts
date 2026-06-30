import type { Prisma, WatchStatus } from "@prisma/client";

import { getAnimeDetail } from "@/lib/anilist";
import { prisma } from "@/lib/prisma";

const TITLE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // refresh cached metadata weekly

/**
 * Make sure a Title row exists for this AniList id (our local cache of the
 * upstream metadata). Refreshes if stale. Returns null if AniList has no such
 * title and we have nothing cached.
 */
export async function ensureTitleCached(animeId: number) {
  const existing = await prisma.title.findUnique({ where: { id: animeId } });
  if (existing && Date.now() - existing.updatedAt.getTime() < TITLE_TTL_MS) {
    return existing;
  }

  const detail = await getAnimeDetail(animeId);
  if (!detail) return existing ?? null;

  const data = {
    title: detail.title,
    coverImage: detail.coverImage,
    coverColor: detail.coverColor,
    bannerImage: detail.bannerImage,
    format: detail.format,
    episodes: detail.episodes,
    duration: detail.duration,
    averageScore: detail.averageScore,
    seasonYear: detail.seasonYear,
    genres: detail.genres,
  };

  return prisma.title.upsert({
    where: { id: animeId },
    create: { id: animeId, ...data },
    update: data,
  });
}

export async function getWatchlist(userId: string) {
  return prisma.watchlistEntry.findMany({
    where: { userId },
    include: { title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getEntry(userId: string, titleId: number) {
  return prisma.watchlistEntry.findUnique({
    where: { userId_titleId: { userId, titleId } },
    include: { title: true },
  });
}

export async function addToWatchlist(
  userId: string,
  animeId: number,
  status: WatchStatus = "PLAN_TO_WATCH",
) {
  const title = await ensureTitleCached(animeId);
  if (!title) throw new Error("Anime not found");

  return prisma.watchlistEntry.upsert({
    where: { userId_titleId: { userId, titleId: animeId } },
    create: { userId, titleId: animeId, status },
    update: { status },
  });
}

export async function updateEntry(
  userId: string,
  titleId: number,
  patch: Pick<
    Prisma.WatchlistEntryUpdateInput,
    "status" | "progress" | "rating" | "notes"
  >,
) {
  // Scoped to the owner — closes the v1 IDOR where any user could edit any row.
  const result = await prisma.watchlistEntry.updateMany({
    where: { userId, titleId },
    data: patch,
  });
  if (result.count === 0) throw new Error("Entry not found");
  return result;
}

export async function removeFromWatchlist(userId: string, titleId: number) {
  return prisma.watchlistEntry.deleteMany({ where: { userId, titleId } });
}

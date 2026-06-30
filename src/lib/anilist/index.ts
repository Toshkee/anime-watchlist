/**
 * High-level AniList API. These are the only functions the rest of the app
 * imports — everything returns our normalized `Anime*` contract.
 */
import { anilistRequest } from "./client";
import { normalizeDetail, normalizeSummary } from "./normalize";
import {
  AIRING_QUERY,
  DETAIL_QUERY,
  SEARCH_QUERY,
  SEASONAL_QUERY,
  TRENDING_QUERY,
} from "./queries";
import type {
  AnimeDetail,
  AnimeFormat,
  AnimeSort,
  AnimeSummary,
  MediaSeason,
  RawMedia,
  RawPage,
  SearchResult,
} from "./types";

export type { AnimeDetail, AnimeSummary, SearchResult } from "./types";

const PER_PAGE = 24;

export interface SearchParams {
  query?: string;
  page?: number;
  perPage?: number;
  sort?: AnimeSort;
  genre?: string;
  season?: MediaSeason;
  seasonYear?: number;
  format?: AnimeFormat;
}

function toSearchResult(data: RawPage<RawMedia>): SearchResult {
  return {
    items: data.Page.media.map(normalizeSummary),
    pageInfo: {
      currentPage: data.Page.pageInfo.currentPage,
      hasNextPage: data.Page.pageInfo.hasNextPage,
      total: data.Page.pageInfo.total,
    },
  };
}

export async function searchAnime(params: SearchParams): Promise<SearchResult> {
  const {
    query,
    page = 1,
    perPage = PER_PAGE,
    sort = query ? "SEARCH_MATCH" : "POPULARITY_DESC",
    genre,
    season,
    seasonYear,
    format,
  } = params;

  const data = await anilistRequest<RawPage<RawMedia>>(
    SEARCH_QUERY,
    {
      search: query || undefined,
      page,
      perPage,
      sort: [sort],
      genre,
      season,
      seasonYear,
      format,
    },
    { revalidate: query ? 120 : 600, tags: ["anilist-search"] },
  );

  return toSearchResult(data);
}

export async function getAnimeDetail(id: number): Promise<AnimeDetail | null> {
  try {
    const data = await anilistRequest<{ Media: RawMedia | null }>(
      DETAIL_QUERY,
      { id },
      { revalidate: 3600, tags: [`anilist-anime-${id}`] },
    );
    return data.Media ? normalizeDetail(data.Media) : null;
  } catch {
    return null;
  }
}

export async function getTrending(perPage = PER_PAGE): Promise<SearchResult> {
  const data = await anilistRequest<RawPage<RawMedia>>(
    TRENDING_QUERY,
    { page: 1, perPage },
    { revalidate: 900, tags: ["anilist-trending"] },
  );
  return toSearchResult(data);
}

export function getCurrentSeason(date = new Date()): {
  season: MediaSeason;
  seasonYear: number;
} {
  const month = date.getUTCMonth(); // 0-11
  const season: MediaSeason =
    month <= 1 || month === 11
      ? "WINTER"
      : month <= 4
        ? "SPRING"
        : month <= 7
          ? "SUMMER"
          : "FALL";
  // December belongs to the upcoming year's Winter season on AniList.
  const seasonYear =
    season === "WINTER" && month === 11
      ? date.getUTCFullYear() + 1
      : date.getUTCFullYear();
  return { season, seasonYear };
}

export async function getPopularThisSeason(
  perPage = PER_PAGE,
): Promise<SearchResult> {
  const { season, seasonYear } = getCurrentSeason();
  const data = await anilistRequest<RawPage<RawMedia>>(
    SEASONAL_QUERY,
    { season, seasonYear, page: 1, perPage },
    { revalidate: 3600, tags: ["anilist-seasonal"] },
  );
  return toSearchResult(data);
}

export interface AiringItem {
  id: number;
  episode: number;
  airingAt: number; // unix seconds
  anime: AnimeSummary;
}

export async function getAiringSchedule(days = 7): Promise<AiringItem[]> {
  const now = Math.floor(Date.now() / 1000);
  const end = now + days * 86400;

  const data = await anilistRequest<{
    Page: {
      airingSchedules: {
        id: number;
        episode: number;
        airingAt: number;
        media: RawMedia | null;
      }[];
    };
  }>(
    AIRING_QUERY,
    { start: now, end, page: 1 },
    { revalidate: 900, tags: ["anilist-airing"] },
  );

  const items: AiringItem[] = [];
  for (const s of data.Page.airingSchedules) {
    if (!s.media || s.media.isAdult) continue;
    items.push({
      id: s.id,
      episode: s.episode,
      airingAt: s.airingAt,
      anime: normalizeSummary(s.media),
    });
  }
  return items;
}

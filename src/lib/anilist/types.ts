/**
 * AniList domain types.
 *
 * `Raw*` shapes mirror the GraphQL responses from https://graphql.anilist.co.
 * The `Anime*` shapes are our normalized, UI-friendly contract — every provider
 * (AniList today, Jikan as a fallback later) is mapped into these so the rest of
 * the app never depends on a specific upstream.
 */

export type AnimeReleaseStatus =
  "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";

export type AnimeFormat =
  "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

// ---------------------------------------------------------------------------
// Raw AniList GraphQL response shapes
// ---------------------------------------------------------------------------

export interface RawMediaTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface RawCoverImage {
  extraLarge: string | null;
  large: string | null;
  color: string | null; // AniList ships an extracted dominant color — our per-title accent
}

export interface RawAiringEpisode {
  episode: number;
  airingAt: number; // unix seconds
  timeUntilAiring: number; // seconds
}

export interface RawMedia {
  id: number;
  idMal: number | null;
  title: RawMediaTitle;
  coverImage: RawCoverImage | null;
  bannerImage: string | null;
  format: AnimeFormat | null;
  status: AnimeReleaseStatus | null;
  episodes: number | null;
  duration: number | null;
  seasonYear: number | null;
  season: MediaSeason | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  genres: string[] | null;
  description: string | null;
  source: string | null;
  isAdult: boolean | null;
  studios?: { nodes: { name: string; isAnimationStudio: boolean }[] } | null;
  tags?: { name: string; rank: number; isMediaSpoiler: boolean }[] | null;
  nextAiringEpisode?: RawAiringEpisode | null;
  trailer?: { id: string | null; site: string | null } | null;
}

export interface RawPage<T> {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
    media: T[];
  };
}

// ---------------------------------------------------------------------------
// Normalized app contract
// ---------------------------------------------------------------------------

export interface AnimeSummary {
  id: number;
  idMal: number | null;
  title: string;
  titleRomaji: string | null;
  titleEnglish: string | null;
  titleNative: string | null;
  coverImage: string | null;
  /** AniList-extracted dominant color of the cover, e.g. "#7c6cf0". Our per-title accent. */
  coverColor: string | null;
  bannerImage: string | null;
  format: AnimeFormat | null;
  releaseStatus: AnimeReleaseStatus | null;
  episodes: number | null;
  duration: number | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
}

export interface AnimeDetail extends AnimeSummary {
  description: string | null;
  season: MediaSeason | null;
  source: string | null;
  popularity: number | null;
  meanScore: number | null;
  studios: string[];
  tags: { name: string; rank: number }[];
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  trailer: { id: string; site: string } | null;
}

export interface SearchResult {
  items: AnimeSummary[];
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
    total: number;
  };
}

export type AnimeSort =
  | "SEARCH_MATCH"
  | "POPULARITY_DESC"
  | "SCORE_DESC"
  | "TRENDING_DESC"
  | "FAVOURITES_DESC"
  | "START_DATE_DESC"
  | "TITLE_ROMAJI";

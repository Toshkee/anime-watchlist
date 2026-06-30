import type { AnimeDetail, AnimeSummary, RawMedia } from "./types";

/** Best human-facing title: prefer English, fall back to romaji, then native. */
function pickTitle(media: RawMedia): string {
  return (
    media.title.english ||
    media.title.romaji ||
    media.title.native ||
    "Untitled"
  );
}

export function normalizeSummary(media: RawMedia): AnimeSummary {
  return {
    id: media.id,
    idMal: media.idMal,
    title: pickTitle(media),
    titleRomaji: media.title.romaji,
    titleEnglish: media.title.english,
    titleNative: media.title.native,
    coverImage: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
    coverColor: media.coverImage?.color ?? null,
    bannerImage: media.bannerImage,
    format: media.format,
    releaseStatus: media.status,
    episodes: media.episodes,
    duration: media.duration,
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
    genres: media.genres ?? [],
  };
}

export function normalizeDetail(media: RawMedia): AnimeDetail {
  return {
    ...normalizeSummary(media),
    description: media.description,
    season: media.season ?? null,
    source: media.source ?? null,
    popularity: media.popularity ?? null,
    meanScore: media.meanScore ?? null,
    studios:
      media.studios?.nodes
        ?.filter((s) => s.isAnimationStudio)
        .map((s) => s.name) ?? [],
    tags:
      media.tags
        ?.filter((t) => !t.isMediaSpoiler)
        .slice(0, 8)
        .map((t) => ({ name: t.name, rank: t.rank })) ?? [],
    nextAiringEpisode: media.nextAiringEpisode
      ? {
          episode: media.nextAiringEpisode.episode,
          airingAt: media.nextAiringEpisode.airingAt,
        }
      : null,
    trailer:
      media.trailer?.id && media.trailer?.site
        ? { id: media.trailer.id, site: media.trailer.site }
        : null,
  };
}

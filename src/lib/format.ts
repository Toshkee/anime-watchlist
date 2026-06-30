import type { AnimeFormat, AnimeReleaseStatus } from "@/lib/anilist/types";

/** AniList averageScore is 0–100; show it as a clean integer percent. */
export function formatScore(score: number | null): string {
  return score == null ? "—" : `${score}`;
}

/** A Tailwind text-color class keyed to score quality (uses our status palette). */
export function scoreToneClass(score: number | null): string {
  if (score == null) return "text-muted-foreground";
  if (score >= 75) return "text-watching";
  if (score >= 60) return "text-hold";
  return "text-dropped";
}

const FORMAT_LABELS: Record<AnimeFormat, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

export function formatLabel(format: AnimeFormat | null): string {
  return format ? (FORMAT_LABELS[format] ?? format) : "Anime";
}

const RELEASE_LABELS: Record<AnimeReleaseStatus, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

export function releaseLabel(status: AnimeReleaseStatus | null): string {
  return status ? RELEASE_LABELS[status] : "";
}

/** "24 eps" / "1 ep" / "" when unknown. */
export function episodesLabel(episodes: number | null): string {
  if (!episodes) return "";
  return `${episodes} ep${episodes === 1 ? "" : "s"}`;
}

/** Compact meta line, e.g. "TV · 2021 · 24 eps". */
export function metaLine(
  parts: Array<string | number | null | undefined>,
): string {
  return parts.filter(Boolean).join(" · ");
}

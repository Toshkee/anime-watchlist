import { describe, expect, it } from "vitest";

import { normalizeDetail, normalizeSummary } from "./normalize";
import type { RawMedia } from "./types";

const base: RawMedia = {
  id: 1,
  idMal: 10,
  title: { romaji: "Romaji", english: "English", native: "ネイティブ" },
  coverImage: { extraLarge: "xl.jpg", large: "lg.jpg", color: "#abcdef" },
  bannerImage: "banner.jpg",
  format: "TV",
  status: "FINISHED",
  episodes: 12,
  duration: 24,
  seasonYear: 2021,
  season: "SPRING",
  averageScore: 80,
  meanScore: 78,
  popularity: 1000,
  genres: ["Action", "Drama"],
  description: "desc",
  source: "MANGA",
  isAdult: false,
};

describe("normalizeSummary", () => {
  it("prefers the English title", () => {
    expect(normalizeSummary(base).title).toBe("English");
  });

  it("falls back romaji → native → Untitled", () => {
    expect(
      normalizeSummary({
        ...base,
        title: { romaji: "R", english: null, native: "N" },
      }).title,
    ).toBe("R");
    expect(
      normalizeSummary({
        ...base,
        title: { romaji: null, english: null, native: "N" },
      }).title,
    ).toBe("N");
    expect(
      normalizeSummary({
        ...base,
        title: { romaji: null, english: null, native: null },
      }).title,
    ).toBe("Untitled");
  });

  it("prefers extraLarge cover, then large, else null", () => {
    expect(normalizeSummary(base).coverImage).toBe("xl.jpg");
    expect(
      normalizeSummary({
        ...base,
        coverImage: { extraLarge: null, large: "lg.jpg", color: null },
      }).coverImage,
    ).toBe("lg.jpg");
    expect(
      normalizeSummary({ ...base, coverImage: null }).coverImage,
    ).toBeNull();
  });

  it("exposes the extracted cover color and defaults genres to []", () => {
    expect(normalizeSummary(base).coverColor).toBe("#abcdef");
    expect(normalizeSummary({ ...base, genres: null }).genres).toEqual([]);
  });
});

describe("normalizeDetail", () => {
  it("keeps only animation studios", () => {
    const detail = normalizeDetail({
      ...base,
      studios: {
        nodes: [
          { name: "Studio A", isAnimationStudio: true },
          { name: "Producer B", isAnimationStudio: false },
        ],
      },
    });
    expect(detail.studios).toEqual(["Studio A"]);
  });

  it("drops spoiler tags and caps at 8", () => {
    const tags = Array.from({ length: 10 }, (_, i) => ({
      name: `tag${i}`,
      rank: 100 - i,
      isMediaSpoiler: false,
    }));
    tags.push({ name: "BIG SPOILER", rank: 99, isMediaSpoiler: true });

    const detail = normalizeDetail({ ...base, tags });
    expect(detail.tags).toHaveLength(8);
    expect(detail.tags.find((t) => t.name === "BIG SPOILER")).toBeUndefined();
  });

  it("maps nextAiringEpisode to episode + airingAt", () => {
    const detail = normalizeDetail({
      ...base,
      nextAiringEpisode: { episode: 5, airingAt: 1234, timeUntilAiring: 60 },
    });
    expect(detail.nextAiringEpisode).toEqual({ episode: 5, airingAt: 1234 });
  });
});

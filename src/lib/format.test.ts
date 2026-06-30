import { describe, expect, it } from "vitest";

import {
  availableEpisodes,
  episodesLabel,
  formatLabel,
  formatScore,
  metaLine,
  releaseLabel,
  scoreToneClass,
} from "./format";

describe("formatScore", () => {
  it("shows an em dash for null", () => {
    expect(formatScore(null)).toBe("—");
  });
  it("stringifies a score", () => {
    expect(formatScore(85)).toBe("85");
  });
});

describe("scoreToneClass", () => {
  it("maps score bands to status colors", () => {
    expect(scoreToneClass(null)).toBe("text-muted-foreground");
    expect(scoreToneClass(90)).toBe("text-watching");
    expect(scoreToneClass(75)).toBe("text-watching");
    expect(scoreToneClass(74)).toBe("text-hold");
    expect(scoreToneClass(60)).toBe("text-hold");
    expect(scoreToneClass(59)).toBe("text-dropped");
  });
});

describe("formatLabel", () => {
  it("humanizes formats", () => {
    expect(formatLabel("TV")).toBe("TV");
    expect(formatLabel("TV_SHORT")).toBe("TV Short");
    expect(formatLabel("MOVIE")).toBe("Movie");
    expect(formatLabel(null)).toBe("Anime");
  });
});

describe("episodesLabel", () => {
  it("pluralizes episodes", () => {
    expect(episodesLabel(1)).toBe("1 ep");
    expect(episodesLabel(12)).toBe("12 eps");
    expect(episodesLabel(null)).toBe("");
    expect(episodesLabel(0)).toBe("");
  });
});

describe("releaseLabel", () => {
  it("humanizes release status", () => {
    expect(releaseLabel("RELEASING")).toBe("Airing");
    expect(releaseLabel("FINISHED")).toBe("Finished");
    expect(releaseLabel(null)).toBe("");
  });
});

describe("metaLine", () => {
  it("joins truthy parts with a middot", () => {
    expect(metaLine(["TV", null, 2021, undefined, "", "24 eps"])).toBe(
      "TV · 2021 · 24 eps",
    );
  });
});

describe("availableEpisodes", () => {
  it("uses the real total for finished shows", () => {
    expect(availableEpisodes(28, null)).toBe(28);
    expect(availableEpisodes(1, null)).toBe(1);
  });
  it("falls back to the latest aired episode for ongoing shows", () => {
    // One Piece: no fixed total, next airing is 1169 → 1168 aired.
    expect(availableEpisodes(null, { episode: 1169 })).toBe(1168);
  });
  it("prefers the known total even while airing", () => {
    expect(availableEpisodes(28, { episode: 13 })).toBe(28);
  });
  it("returns null when nothing is known", () => {
    expect(availableEpisodes(null, null)).toBeNull();
    expect(availableEpisodes(null, undefined)).toBeNull();
    expect(availableEpisodes(null, { episode: 1 })).toBeNull();
  });
});

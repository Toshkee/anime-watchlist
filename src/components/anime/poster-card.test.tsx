import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PosterCard } from "./poster-card";
import type { AnimeSummary } from "@/lib/anilist/types";

// coverImage is null so the card renders its text fallback (no next/image needed).
const anime: AnimeSummary = {
  id: 21,
  idMal: null,
  title: "One Piece",
  titleRomaji: "One Piece",
  titleEnglish: "One Piece",
  titleNative: null,
  coverImage: null,
  coverColor: "#e4a15d",
  bannerImage: null,
  format: "TV",
  releaseStatus: "RELEASING",
  episodes: null,
  duration: 24,
  seasonYear: 1999,
  averageScore: 87,
  genres: ["Action"],
};

describe("PosterCard", () => {
  it("links to the detail page", () => {
    render(<PosterCard anime={anime} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/anime/21");
  });

  it("renders the title and score", () => {
    render(<PosterCard anime={anime} />);
    expect(screen.getAllByText("One Piece").length).toBeGreaterThan(0);
    expect(screen.getByText("87")).toBeInTheDocument();
  });

  it("omits the score chip when there is no score", () => {
    render(<PosterCard anime={{ ...anime, averageScore: null }} />);
    expect(screen.queryByText("87")).not.toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";

import { getCurrentSeason } from "./index";

describe("getCurrentSeason", () => {
  it("maps January to Winter of the same year", () => {
    expect(getCurrentSeason(new Date("2024-01-15T00:00:00Z"))).toEqual({
      season: "WINTER",
      seasonYear: 2024,
    });
  });

  it("maps April to Spring", () => {
    expect(getCurrentSeason(new Date("2024-04-15T00:00:00Z"))).toEqual({
      season: "SPRING",
      seasonYear: 2024,
    });
  });

  it("maps July to Summer", () => {
    expect(getCurrentSeason(new Date("2024-07-15T00:00:00Z"))).toEqual({
      season: "SUMMER",
      seasonYear: 2024,
    });
  });

  it("maps October to Fall", () => {
    expect(getCurrentSeason(new Date("2024-10-15T00:00:00Z"))).toEqual({
      season: "FALL",
      seasonYear: 2024,
    });
  });

  it("rolls December into the next year's Winter season", () => {
    expect(getCurrentSeason(new Date("2024-12-15T00:00:00Z"))).toEqual({
      season: "WINTER",
      seasonYear: 2025,
    });
  });
});

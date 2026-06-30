import { describe, expect, it } from "vitest";

import { credentialsSchema, watchlistUpdateSchema } from "./validation";

describe("credentialsSchema", () => {
  it("accepts a valid username + password", () => {
    expect(
      credentialsSchema.safeParse({
        username: "luffy_01",
        password: "password123",
      }).success,
    ).toBe(true);
  });

  it("rejects a too-short username", () => {
    expect(
      credentialsSchema.safeParse({ username: "ab", password: "password123" })
        .success,
    ).toBe(false);
  });

  it("rejects usernames with disallowed characters", () => {
    expect(
      credentialsSchema.safeParse({
        username: "straw hat!",
        password: "password123",
      }).success,
    ).toBe(false);
  });

  it("rejects a too-short password", () => {
    expect(
      credentialsSchema.safeParse({ username: "luffy", password: "short" })
        .success,
    ).toBe(false);
  });
});

describe("watchlistUpdateSchema", () => {
  it("coerces numeric strings from form data", () => {
    const result = watchlistUpdateSchema.safeParse({
      titleId: "21",
      progress: "5",
      rating: "8",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.titleId).toBe(21);
      expect(result.data.progress).toBe(5);
      expect(result.data.rating).toBe(8);
    }
  });

  it("rejects a rating outside 1–10", () => {
    expect(
      watchlistUpdateSchema.safeParse({ titleId: 21, rating: 11 }).success,
    ).toBe(false);
    expect(
      watchlistUpdateSchema.safeParse({ titleId: 21, rating: 0 }).success,
    ).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(
      watchlistUpdateSchema.safeParse({ titleId: 21, status: "NOT_A_STATUS" })
        .success,
    ).toBe(false);
  });

  it("rejects a non-positive titleId", () => {
    expect(watchlistUpdateSchema.safeParse({ titleId: -1 }).success).toBe(
      false,
    );
  });
});

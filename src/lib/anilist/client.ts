/**
 * Low-level AniList GraphQL transport.
 *
 * Caching strategy (server-side only — the browser never talks to AniList):
 *  - Next.js Data Cache via `next.revalidate` gives a persistent, per-query TTL
 *    cache across requests (tier 1).
 *  - 429 responses are honored with `Retry-After` + a bounded exponential
 *    backoff so we degrade gracefully instead of erroring the user.
 *  - A Postgres TTL cache + a per-provider token-bucket limiter (tier 2/3) slot
 *    in behind this function later without changing any callers.
 */

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const MAX_RETRIES = 2;

export class AniListError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AniListError";
  }
}

interface RequestOptions {
  /** Seconds to cache the response in the Next.js Data Cache. */
  revalidate?: number;
  /** Cache tags for on-demand revalidation. */
  tags?: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function anilistRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate = 300, tags }: RequestOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let res: Response;
    try {
      res = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate, tags },
      });
    } catch (err) {
      // Network-level failure — back off and retry.
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(300 * 2 ** attempt + Math.floor(attempt * 100));
        continue;
      }
      throw new AniListError("Network error contacting AniList");
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After")) || 2;
      if (attempt < MAX_RETRIES) {
        await sleep(retryAfter * 1000);
        continue;
      }
      throw new AniListError("AniList rate limit exceeded", 429);
    }

    if (!res.ok) {
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        await sleep(300 * 2 ** attempt);
        continue;
      }
      throw new AniListError(`AniList responded ${res.status}`, res.status);
    }

    const json = (await res.json()) as {
      data?: T;
      errors?: { message: string }[];
    };

    if (json.errors?.length) {
      throw new AniListError(json.errors.map((e) => e.message).join("; "));
    }
    if (!json.data) {
      throw new AniListError("AniList returned no data");
    }
    return json.data;
  }

  throw new AniListError(
    lastError instanceof Error ? lastError.message : "AniList request failed",
  );
}

"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

const FORMATS: [string, string][] = [
  ["", "Any format"],
  ["TV", "TV"],
  ["MOVIE", "Movie"],
  ["OVA", "OVA"],
  ["ONA", "ONA"],
  ["SPECIAL", "Special"],
  ["TV_SHORT", "TV Short"],
];

const SORTS: [string, string][] = [
  ["", "Relevance"],
  ["POPULARITY_DESC", "Most popular"],
  ["SCORE_DESC", "Highest rated"],
  ["TRENDING_DESC", "Trending"],
  ["START_DATE_DESC", "Newest"],
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) =>
  String(CURRENT_YEAR + 1 - i),
);

const SELECT_CLASS =
  "border-border bg-secondary focus-visible:border-ring focus-visible:ring-ring/40 h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const genre = searchParams.get("genre") ?? "";
  const format = searchParams.get("format") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const year = searchParams.get("year") ?? "";
  const hasFilters = Boolean(genre || format || sort || year);

  function commit(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    startTransition(() =>
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }),
    );
  }

  function setParam(key: string, value: string) {
    commit((params) => (value ? params.set(key, value) : params.delete(key)));
  }

  function clearAll() {
    commit((params) =>
      ["genre", "format", "sort", "year"].forEach((k) => params.delete(k)),
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal className="text-muted-foreground size-4" aria-hidden />

      <select
        aria-label="Sort by"
        value={sort}
        onChange={(e) => setParam("sort", e.target.value)}
        className={SELECT_CLASS}
      >
        {SORTS.map(([v, l]) => (
          <option key={v || "relevance"} value={v}>
            {l}
          </option>
        ))}
      </select>

      <select
        aria-label="Genre"
        value={genre}
        onChange={(e) => setParam("genre", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Any genre</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select
        aria-label="Format"
        value={format}
        onChange={(e) => setParam("format", e.target.value)}
        className={SELECT_CLASS}
      >
        {FORMATS.map(([v, l]) => (
          <option key={v || "any"} value={v}>
            {l}
          </option>
        ))}
      </select>

      <select
        aria-label="Year"
        value={year}
        onChange={(e) => setParam("year", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Any year</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm transition-colors"
        >
          <X className="size-3.5" />
          Clear
        </button>
      )}

      {isPending && (
        <Loader2
          className="text-muted-foreground size-4 animate-spin"
          aria-hidden
        />
      )}
    </div>
  );
}

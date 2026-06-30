import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { PosterGrid, PosterGridSkeleton } from "@/components/anime/poster-grid";
import { FilterBar } from "@/components/search/filter-bar";
import { SearchBar } from "@/components/search/search-bar";
import { getTrending, searchAnime, type SearchResult } from "@/lib/anilist";
import type { AnimeFormat, AnimeSort } from "@/lib/anilist/types";

interface RawParams {
  q?: string;
  genre?: string;
  format?: string;
  sort?: string;
  year?: string;
}

interface SearchPageProps {
  searchParams: Promise<RawParams>;
}

interface Filters {
  query: string;
  genre?: string;
  format?: AnimeFormat;
  year?: number;
  sort?: AnimeSort;
}

function parseFilters(p: RawParams): Filters {
  return {
    query: (p.q ?? "").trim(),
    genre: p.genre || undefined,
    format: (p.format as AnimeFormat) || undefined,
    year: p.year ? Number(p.year) : undefined,
    sort: (p.sort as AnimeSort) || undefined,
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `“${q}” — Search` : "Search" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseFilters(await searchParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mx-auto mb-5 max-w-2xl">
        <Suspense
          fallback={
            <div className="border-border bg-card/80 h-12 w-full rounded-full border" />
          }
        >
          <SearchBar initialQuery={filters.query} autoFocus />
        </Suspense>
      </div>
      <div className="mb-8 flex justify-center">
        <Suspense fallback={<div className="h-9" />}>
          <FilterBar />
        </Suspense>
      </div>

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<PosterGridSkeleton count={18} />}
      >
        <Results filters={filters} />
      </Suspense>
    </div>
  );
}

async function Results({ filters }: { filters: Filters }) {
  const { query, genre, format, year, sort } = filters;
  const isBrowsing = Boolean(genre || format || year || sort);

  if (!query && !isBrowsing) {
    let trending: SearchResult | null = null;
    try {
      trending = await getTrending(24);
    } catch {
      trending = null;
    }
    if (!trending) return <ErrorState />;
    return (
      <section>
        <h2 className="font-heading text-muted-foreground mb-5 text-lg font-semibold tracking-tight">
          Trending now
        </h2>
        <PosterGrid items={trending.items} priorityCount={6} />
      </section>
    );
  }

  let result: SearchResult | null = null;
  try {
    result = await searchAnime({
      query: query || undefined,
      genre,
      format,
      seasonYear: year,
      sort: sort ?? (query ? "SEARCH_MATCH" : "POPULARITY_DESC"),
      perPage: 30,
    });
  } catch {
    result = null;
  }

  if (!result) return <ErrorState />;
  if (result.items.length === 0) return <EmptyState query={query} />;

  return (
    <section>
      <p className="text-muted-foreground mb-5 text-sm">
        <span className="tabular text-foreground">
          {result.pageInfo.total.toLocaleString()}
        </span>{" "}
        result{result.pageInfo.total === 1 ? "" : "s"}
        {query ? (
          <>
            {" "}
            for <span className="text-foreground">“{query}”</span>
          </>
        ) : null}
      </p>
      <PosterGrid items={result.items} priorityCount={6} />
    </section>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="border-border bg-card text-muted-foreground mx-auto grid size-14 place-items-center rounded-2xl border">
        <SearchX className="size-6" />
      </div>
      <h2 className="font-heading mt-5 text-xl font-semibold">No matches</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {query
          ? `Nothing came back for “${query}”. Try different filters or check the spelling.`
          : "No anime matched those filters. Try widening them."}
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-muted-foreground mx-auto max-w-md py-20 text-center text-sm">
      Couldn&apos;t reach AniList right now. Please try again in a moment.
    </div>
  );
}

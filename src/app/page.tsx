import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Flame, SearchX, Sparkles, Star, TrendingUp } from "lucide-react";

import { PosterGrid, PosterGridSkeleton } from "@/components/anime/poster-grid";
import { FilterBar } from "@/components/search/filter-bar";
import { SearchBar } from "@/components/search/search-bar";
import {
  getCurrentSeason,
  getPopularThisSeason,
  getTrending,
  searchAnime,
  type SearchResult,
} from "@/lib/anilist";
import type { AnimeFormat, AnimeSort } from "@/lib/anilist/types";

const SEASON_LABEL: Record<string, string> = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

const QUICK_PICKS = ["Frieren", "One Piece", "Jujutsu Kaisen", "Cowboy Bebop"];

interface RawParams {
  q?: string;
  genre?: string;
  format?: string;
  sort?: string;
  year?: string;
}

interface Filters {
  query: string;
  genre?: string;
  format?: AnimeFormat;
  year?: number;
  sort?: AnimeSort;
}

interface BrowsePageProps {
  searchParams: Promise<RawParams>;
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

function isSearching(f: Filters): boolean {
  return Boolean(f.query || f.genre || f.format || f.year || f.sort);
}

export async function generateMetadata({
  searchParams,
}: BrowsePageProps): Promise<Metadata> {
  const { q } = await searchParams;
  // The landing/browse view keeps the brand title ("Arc — Track the anime you
  // love") from the root layout default; only an active search gets its own.
  return q ? { title: `“${q}” — Browse` } : {};
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const filters = parseFilters(await searchParams);
  const searching = isSearching(filters);

  return (
    <div>
      {searching ? (
        <SearchHeader filters={filters} />
      ) : (
        <DiscoverHero query={filters.query} />
      )}

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        {searching ? (
          <Suspense
            key={JSON.stringify(filters)}
            fallback={<PosterGridSkeleton count={18} />}
          >
            <Results filters={filters} />
          </Suspense>
        ) : (
          <div className="space-y-16">
            <Suspense
              fallback={
                <SectionFallback
                  title="Trending now"
                  icon={<Flame className="size-5" />}
                />
              }
            >
              <TrendingSection />
            </Suspense>
            <Suspense
              fallback={
                <SectionFallback
                  title="Popular this season"
                  icon={<Sparkles className="size-5" />}
                />
              }
            >
              <SeasonalSection />
            </Suspense>
            <Suspense
              fallback={
                <SectionFallback
                  title="Top of all time"
                  icon={<Star className="size-5" />}
                />
              }
            >
              <TopAllTimeSection />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Discover (idle) state ---------- */

function DiscoverHero({ query }: { query: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-10 text-center sm:px-6 sm:pt-28">
        <span className="border-border bg-card/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <TrendingUp className="text-primary size-3.5" />
          Powered by the AniList GraphQL API
        </span>
        <h1 className="font-heading mt-6 text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
          Track the anime
          <br />
          <span className="text-primary">you love.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base text-balance sm:text-lg">
          Search half a million titles, build your watchlist, follow episode
          progress, and watch your taste turn into stats.
        </p>
        <div className="mx-auto mt-8 max-w-xl space-y-4">
          <Suspense
            fallback={
              <div className="border-border bg-card/80 h-12 w-full rounded-full border" />
            }
          >
            <SearchBar initialQuery={query} autoFocus />
          </Suspense>
          <Suspense fallback={<div className="h-9" />}>
            <div className="flex justify-center">
              <FilterBar />
            </div>
          </Suspense>
        </div>
        <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-xs">Try</span>
          {QUICK_PICKS.map((pick) => (
            <Link
              key={pick}
              href={`/?q=${encodeURIComponent(pick)}`}
              className="border-border bg-card/50 hover:border-ring hover:text-foreground rounded-full border px-3 py-1 text-xs transition-colors"
            >
              {pick}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  icon,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="font-heading flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground shrink-0 text-sm transition-colors"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

function SectionFallback({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <section>
      <SectionHeading title={title} icon={icon} />
      <PosterGridSkeleton count={12} />
    </section>
  );
}

function SectionError({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <section>
      <SectionHeading title={title} icon={icon} />
      <p className="border-border bg-card/50 text-muted-foreground rounded-xl border p-6 text-sm">
        Couldn&apos;t reach AniList right now. Please try again in a moment.
      </p>
    </section>
  );
}

async function TrendingSection() {
  const icon = <Flame className="size-5" />;
  let result: SearchResult | null = null;
  try {
    result = await getTrending(12);
  } catch {
    result = null;
  }
  if (!result) return <SectionError title="Trending now" icon={icon} />;
  return (
    <section>
      <SectionHeading
        title="Trending now"
        icon={icon}
        href="/?sort=TRENDING_DESC"
      />
      <PosterGrid items={result.items} priorityCount={6} />
    </section>
  );
}

async function SeasonalSection() {
  const icon = <Sparkles className="size-5" />;
  const { season, seasonYear } = getCurrentSeason();
  const title = `Popular this season · ${SEASON_LABEL[season]} ${seasonYear}`;
  let result: SearchResult | null = null;
  try {
    result = await getPopularThisSeason(12);
  } catch {
    result = null;
  }
  if (!result) return <SectionError title={title} icon={icon} />;
  return (
    <section>
      <SectionHeading title={title} icon={icon} />
      <PosterGrid items={result.items} />
    </section>
  );
}

async function TopAllTimeSection() {
  const icon = <Star className="size-5" />;
  let result: SearchResult | null = null;
  try {
    result = await searchAnime({ sort: "SCORE_DESC", perPage: 12 });
  } catch {
    result = null;
  }
  if (!result) return <SectionError title="Top of all time" icon={icon} />;
  return (
    <section>
      <SectionHeading
        title="Top of all time"
        icon={icon}
        href="/?sort=SCORE_DESC"
      />
      <PosterGrid items={result.items} />
    </section>
  );
}

/* ---------- Search (active) state ---------- */

function SearchHeader({ filters }: { filters: Filters }) {
  return (
    <section className="border-border/60 border-b">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Suspense
            fallback={
              <div className="border-border bg-card/80 h-12 w-full rounded-full border" />
            }
          >
            <SearchBar initialQuery={filters.query} autoFocus />
          </Suspense>
        </div>
        <div className="mt-4 flex justify-center">
          <Suspense fallback={<div className="h-9" />}>
            <FilterBar />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function Results({ filters }: { filters: Filters }) {
  const { query, genre, format, year, sort } = filters;

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
    <section className="pt-8">
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

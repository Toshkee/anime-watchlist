import { Suspense } from "react";
import Link from "next/link";
import { Flame, Sparkles, TrendingUp } from "lucide-react";

import { PosterGrid, PosterGridSkeleton } from "@/components/anime/poster-grid";
import { SearchBar } from "@/components/search/search-bar";
import {
  getCurrentSeason,
  getPopularThisSeason,
  getTrending,
  type SearchResult,
} from "@/lib/anilist";

const SEASON_LABEL: Record<string, string> = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

const QUICK_PICKS = ["Frieren", "One Piece", "Jujutsu Kaisen", "Cowboy Bebop"];

export default function HomePage() {
  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-7xl space-y-16 px-4 pb-8 sm:px-6">
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
      </div>
    </div>
  );
}

function Hero() {
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
        <div className="mx-auto mt-8 max-w-xl">
          <Suspense
            fallback={
              <div className="border-border bg-card/80 h-12 w-full rounded-full border" />
            }
          >
            <SearchBar autoFocus />
          </Suspense>
        </div>
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-xs">Try</span>
          {QUICK_PICKS.map((pick) => (
            <Link
              key={pick}
              href={`/search?q=${encodeURIComponent(pick)}`}
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
      <SectionHeading title="Trending now" icon={icon} href="/search" />
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

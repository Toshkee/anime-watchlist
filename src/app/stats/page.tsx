import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import type { WatchStatus } from "@prisma/client";

import { auth } from "@/auth";
import {
  GenreBars,
  RatingHistogram,
  StatusDonut,
} from "@/components/stats/charts";
import { buttonVariants } from "@/components/ui/button";
import { getWatchlist } from "@/lib/watchlist";
import {
  STATUS_HEX,
  WATCH_STATUS_LABEL,
  WATCH_STATUS_ORDER,
} from "@/lib/watch-status";

export const metadata: Metadata = { title: "Your stats" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await getWatchlist(session.user.id);
  const total = entries.length;

  if (total === 0) return <EmptyStats />;

  const statusCounts: Partial<Record<WatchStatus, number>> = {};
  const genreCount = new Map<string, number>();
  const ratings: number[] = [];
  let totalEpisodes = 0;
  let minutes = 0;

  for (const e of entries) {
    statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;
    totalEpisodes += e.progress;
    minutes += e.progress * (e.title.duration ?? 24);
    if (e.rating != null) ratings.push(e.rating);
    for (const g of e.title.genres)
      genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
  }

  const hours = Math.round(minutes / 60);
  const days = minutes / 1440;
  const meanRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null;
  const completionRate = Math.round(
    ((statusCounts.COMPLETED ?? 0) / total) * 100,
  );

  const statusData = WATCH_STATUS_ORDER.filter((s) => statusCounts[s]).map(
    (s) => ({
      status: s,
      name: WATCH_STATUS_LABEL[s],
      value: statusCounts[s] as number,
      fill: STATUS_HEX[s],
    }),
  );
  const ratingData = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: ratings.filter((r) => r === i + 1).length,
  }));
  const genreData = [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, count]) => ({ genre, count }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="bg-primary/15 text-primary ring-primary/25 grid size-9 place-items-center rounded-lg ring-1">
          <BarChart3 className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Your stats
          </h1>
          <p className="text-muted-foreground text-sm">
            What your watchlist says about your taste.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Titles" value={total.toLocaleString()} />
        <StatTile
          label="Episodes watched"
          value={totalEpisodes.toLocaleString()}
        />
        <StatTile
          label="Hours watched"
          value={hours.toLocaleString()}
          sub={`≈ ${days.toFixed(1)} days`}
        />
        <StatTile
          label="Mean rating"
          value={meanRating ? meanRating.toFixed(1) : "—"}
          sub={meanRating ? "/ 10" : "no ratings yet"}
        />

        <Tile className="col-span-2" title="Status breakdown">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <StatusDonut data={statusData} />
            </div>
            <ul className="space-y-1.5 text-sm">
              {statusData.map((d) => (
                <li key={d.status} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: d.fill }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="tabular ml-auto font-medium">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Tile>

        <Tile className="col-span-2" title="Top genres">
          <GenreBars data={genreData} />
        </Tile>

        <Tile className="col-span-2" title="Your ratings">
          {ratings.length > 0 ? (
            <RatingHistogram data={ratingData} />
          ) : (
            <p className="text-muted-foreground flex h-[210px] items-center justify-center text-sm">
              Rate some titles to see your distribution.
            </p>
          )}
        </Tile>

        <Tile className="col-span-2" title="Completion rate">
          <div className="flex h-[210px] flex-col items-center justify-center">
            <span className="text-primary tabular text-6xl font-semibold">
              {completionRate}%
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              {statusCounts.COMPLETED ?? 0} of {total} completed
            </p>
            <div className="bg-secondary mt-4 h-2 w-48 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </Tile>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="border-border bg-card/40 rounded-2xl border p-5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="tabular mt-1 text-3xl font-semibold">{value}</p>
      {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
    </div>
  );
}

function Tile({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-border bg-card/40 rounded-2xl border p-5 ${className}`}
    >
      <h2 className="text-muted-foreground mb-3 text-sm font-semibold">
        {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyStats() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold">No stats yet</h1>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
        Add anime to your watchlist and track a few episodes — your stats will
        come to life here.
      </p>
      <Link href="/" className={`${buttonVariants()} mt-6 h-10 px-5`}>
        Browse anime
      </Link>
    </div>
  );
}

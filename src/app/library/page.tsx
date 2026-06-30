import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Library } from "lucide-react";
import type { WatchStatus } from "@prisma/client";

import { auth } from "@/auth";
import { LibraryCard } from "@/components/anime/library-card";
import { LibraryFilters } from "@/components/anime/library-filters";
import { buttonVariants } from "@/components/ui/button";
import { getWatchlist } from "@/lib/watchlist";
import { WATCH_STATUS_ORDER } from "@/lib/watch-status";

export const metadata: Metadata = { title: "Your library" };

const STATUS_SET = new Set<string>(WATCH_STATUS_ORDER);

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status: statusParam } = await searchParams;
  const activeStatus =
    statusParam && STATUS_SET.has(statusParam)
      ? (statusParam as WatchStatus)
      : null;

  const entries = await getWatchlist(session.user.id);

  const counts = entries.reduce<Partial<Record<WatchStatus, number>>>(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const visible = activeStatus
    ? entries.filter((e) => e.status === activeStatus)
    : entries;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="bg-primary/15 text-primary ring-primary/25 grid size-9 place-items-center rounded-lg ring-1">
          <Library className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {session.user.name}&apos;s library
          </h1>
          <p className="text-muted-foreground text-sm">
            {entries.length} {entries.length === 1 ? "title" : "titles"}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          <div className="mt-6">
            <Suspense fallback={<div className="h-8" />}>
              <LibraryFilters counts={counts} total={entries.length} />
            </Suspense>
          </div>

          {visible.length === 0 ? (
            <p className="text-muted-foreground mt-12 text-center text-sm">
              Nothing in this list yet.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((entry) => (
                <LibraryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="border-border bg-card/30 mt-10 rounded-2xl border border-dashed py-16 text-center">
      <h2 className="font-heading text-xl font-semibold">
        Your watchlist is empty
      </h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
        Find something to watch and add it to start tracking your progress.
      </p>
      <Link href="/" className={`${buttonVariants()} mt-6 h-10 px-5`}>
        Browse anime
      </Link>
    </div>
  );
}

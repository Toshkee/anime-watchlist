import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Library } from "lucide-react";
import type { WatchStatus } from "@prisma/client";

import { auth } from "@/auth";
import { EntryControls } from "@/components/anime/entry-controls";
import { buttonVariants } from "@/components/ui/button";
import { metaLine, formatLabel } from "@/lib/format";
import { getWatchlist } from "@/lib/watchlist";
import {
  WATCH_STATUS_DOT,
  WATCH_STATUS_LABEL,
  WATCH_STATUS_ORDER,
} from "@/lib/watch-status";
import type { AnimeFormat } from "@/lib/anilist/types";

export const metadata: Metadata = { title: "Your library" };

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await getWatchlist(session.user.id);

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
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

      {entries.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {WATCH_STATUS_ORDER.filter((s) => counts[s]).map((s) => (
            <span
              key={s}
              className="border-border bg-card/50 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
            >
              <span className={`size-2 rounded-full ${WATCH_STATUS_DOT[s]}`} />
              {WATCH_STATUS_LABEL[s]}
              <span className="tabular text-muted-foreground">{counts[s]}</span>
            </span>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <ul className="mt-8 space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="border-border bg-card/40 flex flex-wrap items-center gap-4 rounded-xl border p-3"
            >
              <Link
                href={`/anime/${entry.titleId}`}
                className="bg-muted relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-md"
              >
                {entry.title.coverImage && (
                  <Image
                    src={entry.title.coverImage}
                    alt={entry.title.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/anime/${entry.titleId}`}
                  className="hover:text-primary line-clamp-1 font-medium transition-colors"
                >
                  {entry.title.title}
                </Link>
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                  <span
                    className={`size-2 rounded-full ${WATCH_STATUS_DOT[entry.status as WatchStatus]}`}
                  />
                  {WATCH_STATUS_LABEL[entry.status as WatchStatus]}
                  <span className="text-muted-foreground/60">·</span>
                  <span className="tabular">
                    {metaLine([
                      formatLabel(entry.title.format as AnimeFormat | null),
                      entry.title.seasonYear,
                    ])}
                  </span>
                </p>
              </div>

              <EntryControls
                titleId={entry.titleId}
                status={entry.status}
                progress={entry.progress}
                episodes={entry.title.episodes}
              />
            </li>
          ))}
        </ul>
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

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Title, WatchlistEntry } from "@prisma/client";

import { EntryControls } from "@/components/anime/entry-controls";
import { formatLabel, metaLine } from "@/lib/format";
import { WATCH_STATUS_DOT, WATCH_STATUS_LABEL } from "@/lib/watch-status";
import type { AnimeFormat } from "@/lib/anilist/types";
import { cn } from "@/lib/utils";

type LibraryEntry = WatchlistEntry & { title: Title };

export function LibraryCard({ entry }: { entry: LibraryEntry }) {
  const { title, status } = entry;
  const episodes = title.episodes;
  const pct =
    episodes && episodes > 0
      ? Math.min(100, Math.round((entry.progress / episodes) * 100))
      : null;
  const href = `/anime/${entry.titleId}`;
  const meta = metaLine([
    formatLabel(title.format as AnimeFormat | null),
    title.seasonYear,
  ]);

  return (
    <div className="group border-border bg-card/40 flex flex-col overflow-hidden rounded-xl border transition-colors hover:border-white/15">
      <Link href={href} className="relative block aspect-[2/3] overflow-hidden">
        {title.coverImage ? (
          <Image
            src={title.coverImage}
            alt={title.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center px-2 text-center text-xs">
            {title.title}
          </div>
        )}

        {/* Status pill */}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          <span
            className={cn("size-1.5 rounded-full", WATCH_STATUS_DOT[status])}
          />
          {WATCH_STATUS_LABEL[status]}
        </span>

        {/* Your rating */}
        {entry.rating != null && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-amber-300 backdrop-blur-sm">
            <Star className="size-3 fill-current" />
            <span className="tabular">{entry.rating}</span>
          </span>
        )}

        {/* Progress bar pinned to the poster's bottom edge */}
        {pct != null && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/40">
            <div
              className={cn("h-full transition-all", WATCH_STATUS_DOT[status])}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div>
          <Link
            href={href}
            className="hover:text-primary line-clamp-1 text-sm font-medium transition-colors"
          >
            {title.title}
          </Link>
          {meta && (
            <p className="text-muted-foreground tabular mt-0.5 text-[11px]">
              {meta}
            </p>
          )}
        </div>

        <div className="mt-auto">
          <EntryControls
            titleId={entry.titleId}
            status={status}
            progress={entry.progress}
            episodes={episodes}
            rating={entry.rating}
          />
        </div>
      </div>
    </div>
  );
}

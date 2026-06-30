import type { AnimeSummary } from "@/lib/anilist/types";
import { cn } from "@/lib/utils";
import { PosterCard } from "./poster-card";

const GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function PosterGrid({
  items,
  className,
  priorityCount = 0,
}: {
  items: AnimeSummary[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(GRID_CLASS, "animate-in fade-in-0 duration-500", className)}
    >
      {items.map((anime, i) => (
        <PosterCard key={anime.id} anime={anime} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted aspect-[2/3] w-full rounded-xl" />
          <div className="bg-muted mt-2 h-3.5 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { AnimeSummary } from "@/lib/anilist/types";
import {
  episodesLabel,
  formatLabel,
  formatScore,
  metaLine,
  scoreToneClass,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface PosterCardProps {
  anime: AnimeSummary;
  priority?: boolean;
  className?: string;
}

export function PosterCard({ anime, priority, className }: PosterCardProps) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn(
        "group block transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-none",
        className,
      )}
    >
      <div className="border-border bg-card group-focus-visible:border-ring relative aspect-[2/3] w-full overflow-hidden rounded-xl border shadow-sm transition-colors duration-300 group-hover:border-white/15">
        {anime.coverImage ? (
          <Image
            src={anime.coverImage}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 24vw, 200px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center px-2 text-center text-xs">
            {anime.title}
          </div>
        )}

        {anime.averageScore != null && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="size-3 fill-current text-amber-300" />
            <span
              className={cn(
                "tabular text-xs font-medium",
                scoreToneClass(anime.averageScore),
              )}
            >
              {formatScore(anime.averageScore)}
            </span>
          </div>
        )}

        {/* Hover overlay — calm at rest, reveals meta on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="tabular text-[11px] font-medium text-white/80">
            {metaLine([
              formatLabel(anime.format),
              anime.seasonYear,
              episodesLabel(anime.episodes),
            ])}
          </p>
        </div>
      </div>

      <h3 className="text-foreground/90 group-hover:text-foreground mt-2 line-clamp-2 text-sm leading-snug font-medium transition-colors">
        {anime.title}
      </h3>
    </Link>
  );
}

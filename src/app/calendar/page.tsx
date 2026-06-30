import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { getAiringSchedule, type AiringItem } from "@/lib/anilist";

export const metadata: Metadata = { title: "Airing calendar" };

export default async function CalendarPage() {
  let items: AiringItem[] | null = null;
  try {
    items = await getAiringSchedule(7);
  } catch {
    items = null;
  }

  const groups = new Map<string, AiringItem[]>();
  for (const item of items ?? []) {
    const key = new Date(item.airingAt * 1000).toDateString();
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="bg-primary/15 text-primary ring-primary/25 grid size-9 place-items-center rounded-lg ring-1">
          <CalendarDays className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Airing this week
          </h1>
          <p className="text-muted-foreground text-sm">
            Upcoming episodes, straight from AniList.
          </p>
        </div>
      </div>

      {items === null ? (
        <p className="text-muted-foreground mt-10 text-sm">
          Couldn&apos;t reach AniList right now. Please try again in a moment.
        </p>
      ) : groups.size === 0 ? (
        <p className="text-muted-foreground mt-10 text-sm">
          Nothing scheduled in the next 7 days.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {[...groups.entries()].map(([day, list]) => (
            <section key={day}>
              <h2 className="text-foreground/80 mb-3 text-sm font-semibold">
                {dayLabel(new Date(day))}
              </h2>
              <ul className="space-y-2">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className="border-border bg-card/40 flex items-center gap-3 rounded-xl border p-2.5 transition-colors hover:border-white/15"
                  >
                    <time className="tabular text-muted-foreground w-14 shrink-0 text-center text-sm">
                      {timeLabel(item.airingAt)}
                    </time>
                    <Link
                      href={`/anime/${item.anime.id}`}
                      className="bg-muted relative aspect-[2/3] w-9 shrink-0 overflow-hidden rounded"
                    >
                      {item.anime.coverImage && (
                        <Image
                          src={item.anime.coverImage}
                          alt={item.anime.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/anime/${item.anime.id}`}
                        className="hover:text-primary line-clamp-1 text-sm font-medium transition-colors"
                      >
                        {item.anime.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        Episode {item.episode}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function timeLabel(airingAt: number): string {
  return new Date(airingAt * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

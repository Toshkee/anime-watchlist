import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, Star } from "lucide-react";

import { auth } from "@/auth";
import { TrackActions } from "@/components/anime/track-actions";
import { Badge } from "@/components/ui/badge";
import { getAnimeDetail } from "@/lib/anilist";
import { getEntry } from "@/lib/watchlist";
import {
  episodesLabel,
  formatLabel,
  formatScore,
  metaLine,
  releaseLabel,
  scoreToneClass,
} from "@/lib/format";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnimeDetail(Number(id));
  if (!anime) return { title: "Not found" };
  return {
    title: anime.title,
    description: stripHtml(anime.description ?? "").slice(0, 160) || undefined,
  };
}

export default async function AnimeDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const animeId = Number(id);
  if (!Number.isFinite(animeId)) notFound();

  const anime = await getAnimeDetail(animeId);
  if (!anime) notFound();

  const session = await auth();
  const entry = session?.user?.id
    ? await getEntry(session.user.id, animeId)
    : null;

  const accent = anime.coverColor ?? "#7c6cf0";
  const synopsis = stripHtml(anime.description ?? "");
  const countdown = nextAiringLabel(anime.nextAiringEpisode);

  return (
    <article
      style={{ "--title-accent": accent } as React.CSSProperties}
      className="pb-10"
    >
      {/* Cinematic banner */}
      <div className="relative h-[36vh] min-h-[260px] w-full overflow-hidden sm:h-[44vh] sm:max-h-[460px]">
        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--title-accent) 45%, #0b0c10), #0b0c10)",
            }}
          />
        )}
        {/* Color scrim + fade to background */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--background) 6%, color-mix(in oklab, var(--title-accent) 16%, transparent) 90%)",
          }}
        />
        <div
          aria-hidden
          className="from-background/70 absolute inset-0 bg-gradient-to-r via-transparent to-transparent"
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative -mt-28 grid grid-cols-1 gap-6 sm:-mt-36 sm:grid-cols-[208px_1fr] sm:gap-8">
          {/* Poster */}
          <div className="relative mx-auto w-40 sm:mx-0 sm:w-52">
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-3xl opacity-40 blur-2xl"
              style={{ background: "var(--title-accent)" }}
            />
            <div className="bg-card relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              {anime.coverImage && (
                <Image
                  src={anime.coverImage}
                  alt={anime.title}
                  fill
                  sizes="208px"
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="sm:pt-32">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {anime.title}
            </h1>
            {anime.titleNative && anime.titleNative !== anime.title && (
              <p className="text-muted-foreground mt-1 text-sm">
                {anime.titleNative}
              </p>
            )}

            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {anime.averageScore != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-300 text-amber-300" />
                  <span
                    className={`tabular font-semibold ${scoreToneClass(anime.averageScore)}`}
                  >
                    {formatScore(anime.averageScore)}
                  </span>
                  <span className="text-xs">/ 100</span>
                </span>
              )}
              <span className="tabular">
                {metaLine([
                  formatLabel(anime.format),
                  anime.seasonYear,
                  episodesLabel(anime.episodes),
                  releaseLabel(anime.releaseStatus),
                ])}
              </span>
            </div>

            {countdown && (
              <div className="border-border bg-card/60 text-foreground/80 mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                <CalendarClock className="text-primary size-3.5" />
                {countdown}
              </div>
            )}

            {anime.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Badge key={g} variant="secondary" className="rounded-full">
                    {g}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-6">
              <TrackActions
                animeId={anime.id}
                title={anime.title}
                isAuthed={!!session?.user}
                initialStatus={entry?.status ?? null}
              />
            </div>
          </div>
        </div>

        {/* Synopsis + sidebar */}
        <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_240px]">
          <div>
            <h2 className="font-heading text-lg font-semibold">Synopsis</h2>
            <div className="text-foreground/85 mt-3 space-y-3 leading-relaxed">
              {synopsis ? (
                synopsis.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-muted-foreground">No synopsis available.</p>
              )}
            </div>

            {anime.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-muted-foreground text-sm font-semibold">
                  Tags
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {anime.tags.map((t) => (
                    <span
                      key={t.name}
                      className="border-border text-foreground/70 rounded-full border px-2.5 py-0.5 text-xs"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 text-sm">
            <InfoRow label="Format" value={formatLabel(anime.format)} />
            <InfoRow
              label="Episodes"
              value={anime.episodes ? String(anime.episodes) : "—"}
            />
            <InfoRow
              label="Duration"
              value={anime.duration ? `${anime.duration} min` : "—"}
            />
            <InfoRow
              label="Status"
              value={releaseLabel(anime.releaseStatus) || "—"}
            />
            <InfoRow
              label="Studio"
              value={anime.studios.length ? anime.studios.join(", ") : "—"}
            />
            <InfoRow
              label="Mean score"
              value={anime.meanScore != null ? `${anime.meanScore} / 100` : "—"}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/60 flex items-center justify-between gap-4 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground/90 text-right font-medium">{value}</span>
    </div>
  );
}

/** AniList descriptions contain light HTML even with asHtml:false. Flatten to text. */
function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function nextAiringLabel(
  next: { episode: number; airingAt: number } | null,
): string | null {
  if (!next) return null;
  const secondsUntil = next.airingAt - Math.floor(Date.now() / 1000);
  if (secondsUntil <= 0) return `Episode ${next.episode} aired recently`;
  const days = Math.floor(secondsUntil / 86400);
  const hours = Math.floor((secondsUntil % 86400) / 3600);
  const parts = [days ? `${days}d` : null, `${hours}h`].filter(Boolean);
  return `Episode ${next.episode} airs in ${parts.join(" ")}`;
}

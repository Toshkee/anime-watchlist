"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { WatchStatus } from "@prisma/client";

import {
  addToWatchlistAction,
  removeEntryAction,
  updateEntryAction,
} from "@/lib/actions/watchlist";
import { WATCH_STATUS_LABEL, WATCH_STATUS_ORDER } from "@/lib/watch-status";
import { Button } from "@/components/ui/button";
import { EpisodeStepper } from "./episode-stepper";
import { RatingControl } from "./rating-control";

export function TrackActions({
  animeId,
  title,
  isAuthed,
  initialStatus,
  progress,
  rating,
  episodes,
}: {
  animeId: number;
  title: string;
  isAuthed: boolean;
  initialStatus: WatchStatus | null;
  progress: number;
  rating: number | null;
  episodes: number | null;
}) {
  const [status, setStatus] = useState<WatchStatus | null>(initialStatus);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function add() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      try {
        await addToWatchlistAction(animeId);
        setStatus("PLAN_TO_WATCH");
        toast.success("Added to your watchlist", { description: title });
        router.refresh();
      } catch {
        toast.error("Couldn't add this title. Try again.");
      }
    });
  }

  function changeStatus(next: WatchStatus) {
    const prev = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      try {
        await updateEntryAction({ titleId: animeId, status: next });
        router.refresh();
      } catch {
        setStatus(prev); // rollback
        toast.error("Couldn't update status");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await removeEntryAction(animeId);
        setStatus(null);
        toast("Removed from your watchlist");
        router.refresh();
      } catch {
        toast.error("Couldn't remove this title");
      }
    });
  }

  if (!status) {
    return (
      <Button className="h-11 px-5" disabled={pending} onClick={add}>
        <Plus className="size-4" />
        Add to Watchlist
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="border-primary/30 bg-primary/10 text-primary inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium">
          <Check className="size-4" />
          In your library
        </span>

        <select
          aria-label="Watch status"
          value={status}
          disabled={pending}
          onChange={(e) => changeStatus(e.target.value as WatchStatus)}
          className="border-border bg-secondary focus-visible:border-ring focus-visible:ring-ring/40 h-11 rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
        >
          {WATCH_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {WATCH_STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <Button
          variant="secondary"
          className="h-11 px-4"
          disabled={pending}
          onClick={remove}
        >
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Episodes
          </span>
          <EpisodeStepper
            titleId={animeId}
            progress={progress}
            episodes={episodes}
            size="md"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Your rating
          </span>
          <RatingControl titleId={animeId} rating={rating} size="md" />
        </div>
      </div>
    </div>
  );
}

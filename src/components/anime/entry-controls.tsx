"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { WatchStatus } from "@prisma/client";

import { removeEntryAction, updateEntryAction } from "@/lib/actions/watchlist";
import { WATCH_STATUS_LABEL, WATCH_STATUS_ORDER } from "@/lib/watch-status";
import { EpisodeStepper } from "./episode-stepper";
import { RatingControl } from "./rating-control";

export function EntryControls({
  titleId,
  status,
  progress,
  episodes,
  rating,
}: {
  titleId: number;
  status: WatchStatus;
  progress: number;
  episodes: number | null;
  rating: number | null;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(fn: () => Promise<unknown>, errorMsg = "Something went wrong") {
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch {
        toast.error(errorMsg);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Status + remove */}
      <div className="flex items-center gap-1.5">
        <select
          aria-label="Status"
          value={status}
          disabled={pending}
          onChange={(e) =>
            run(() =>
              updateEntryAction({
                titleId,
                status: e.target.value as WatchStatus,
              }),
            )
          }
          className="border-border bg-secondary focus-visible:border-ring focus-visible:ring-ring/40 h-7 min-w-0 flex-1 rounded-md border px-1.5 text-[11px] outline-none focus-visible:ring-3"
        >
          {WATCH_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {WATCH_STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-label="Remove from watchlist"
          disabled={pending}
          onClick={() =>
            run(() => removeEntryAction(titleId), "Couldn't remove this title")
          }
          className="text-muted-foreground hover:text-destructive grid size-7 shrink-0 place-items-center rounded-md transition-colors disabled:opacity-40"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Episode progress + rating */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase">
          Eps
        </span>
        <EpisodeStepper
          titleId={titleId}
          progress={progress}
          episodes={episodes}
        />
        <div className="ml-auto">
          <RatingControl titleId={titleId} rating={rating} />
        </div>
      </div>
    </div>
  );
}

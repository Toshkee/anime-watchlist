"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { WatchStatus } from "@prisma/client";

import { removeEntryAction, updateEntryAction } from "@/lib/actions/watchlist";
import { WATCH_STATUS_LABEL, WATCH_STATUS_ORDER } from "@/lib/watch-status";

export function EntryControls({
  titleId,
  status,
  progress,
  episodes,
}: {
  titleId: number;
  status: WatchStatus;
  progress: number;
  episodes: number | null;
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

  const max = episodes ?? undefined;
  const canIncrement = max == null || progress < max;

  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
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
        className="border-border bg-secondary focus-visible:border-ring focus-visible:ring-ring/40 h-8 rounded-md border px-2 text-xs outline-none focus-visible:ring-3"
      >
        {WATCH_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {WATCH_STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      <div className="border-border bg-secondary flex items-center rounded-md border">
        <button
          type="button"
          aria-label="Decrease episode progress"
          disabled={pending || progress <= 0}
          onClick={() =>
            run(() =>
              updateEntryAction({
                titleId,
                progress: Math.max(0, progress - 1),
              }),
            )
          }
          className="hover:text-foreground text-muted-foreground grid size-8 place-items-center disabled:opacity-40"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="tabular min-w-12 text-center text-xs">
          {progress}
          {max != null ? ` / ${max}` : ""}
        </span>
        <button
          type="button"
          aria-label="Increase episode progress"
          disabled={pending || !canIncrement}
          onClick={() =>
            run(() => updateEntryAction({ titleId, progress: progress + 1 }))
          }
          className="hover:text-foreground text-muted-foreground grid size-8 place-items-center disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <button
        type="button"
        aria-label="Remove from watchlist"
        disabled={pending}
        onClick={() =>
          run(() => removeEntryAction(titleId), "Couldn't remove this title")
        }
        className="text-muted-foreground hover:text-destructive grid size-8 place-items-center rounded-md transition-colors disabled:opacity-40"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

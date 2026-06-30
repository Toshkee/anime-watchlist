"use client";

import { useState, useTransition } from "react";
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

  // Local draft so the episode count is directly typeable. Re-syncs (during
  // render, no effect needed) whenever the server sends a fresh `progress` —
  // e.g. after a +/- click or status change refreshes the page.
  const [draft, setDraft] = useState(String(progress));
  const [syncedProgress, setSyncedProgress] = useState(progress);
  if (progress !== syncedProgress) {
    setSyncedProgress(progress);
    setDraft(String(progress));
  }

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

  function setProgress(next: number) {
    const clamped = Math.max(0, max != null ? Math.min(next, max) : next);
    setDraft(String(clamped));
    if (clamped !== progress) {
      run(() => updateEntryAction({ titleId, progress: clamped }));
    }
  }

  function commitDraft() {
    const n = draft.trim() === "" ? 0 : Number.parseInt(draft, 10);
    setProgress(Number.isNaN(n) ? progress : n);
  }

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

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[0.65rem] font-medium tracking-wide uppercase">
          Eps
        </span>
        <div className="border-border bg-secondary flex items-center rounded-md border">
          <button
            type="button"
            aria-label="Decrease episode progress"
            disabled={pending || progress <= 0}
            onClick={() => setProgress(progress - 1)}
            className="hover:text-foreground text-muted-foreground grid size-8 place-items-center disabled:opacity-40"
          >
            <Minus className="size-3.5" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Episodes watched"
            title="Episodes watched — type a number or use +/−"
            value={draft}
            disabled={pending}
            onChange={(e) =>
              setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
            }
            onFocus={(e) => e.currentTarget.select()}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className="tabular focus:text-foreground w-9 bg-transparent text-center text-xs outline-none"
          />
          {max != null && (
            <span className="tabular text-muted-foreground pr-1.5 text-xs">
              / {max}
            </span>
          )}
          <button
            type="button"
            aria-label="Increase episode progress"
            disabled={pending || !canIncrement}
            onClick={() => setProgress(progress + 1)}
            className="hover:text-foreground text-muted-foreground grid size-8 place-items-center disabled:opacity-40"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
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

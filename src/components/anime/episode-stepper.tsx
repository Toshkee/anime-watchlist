"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { updateEntryAction } from "@/lib/actions/watchlist";
import { cn } from "@/lib/utils";

/**
 * Directly-typeable episode counter with +/- steppers. Clamps to `episodes`
 * (the available-episode ceiling) and commits on Enter/blur. Re-syncs from the
 * `progress` prop during render — no effect — after a server refresh.
 */
export function EpisodeStepper({
  titleId,
  progress,
  episodes,
  size = "sm",
}: {
  titleId: number;
  progress: number;
  episodes: number | null;
  size?: "sm" | "md";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [draft, setDraft] = useState(String(progress));
  const [synced, setSynced] = useState(progress);
  if (progress !== synced) {
    setSynced(progress);
    setDraft(String(progress));
  }

  const max = episodes ?? undefined;
  const canIncrement = max == null || progress < max;

  function commit(next: number) {
    const clamped = Math.max(0, max != null ? Math.min(next, max) : next);
    setDraft(String(clamped));
    if (clamped === progress) return;
    startTransition(async () => {
      try {
        await updateEntryAction({ titleId, progress: clamped });
        router.refresh();
      } catch {
        toast.error("Couldn't update progress");
      }
    });
  }

  function commitDraft() {
    const n = draft.trim() === "" ? 0 : Number.parseInt(draft, 10);
    commit(Number.isNaN(n) ? progress : n);
  }

  const md = size === "md";

  return (
    <div
      className={cn(
        "border-border bg-secondary flex items-center rounded-md border",
        md && "h-11 rounded-lg",
      )}
    >
      <button
        type="button"
        aria-label="Decrease episode progress"
        disabled={pending || progress <= 0}
        onClick={() => commit(progress - 1)}
        className={cn(
          "hover:text-foreground text-muted-foreground grid place-items-center disabled:opacity-40",
          md ? "size-11" : "size-7",
        )}
      >
        <Minus className={md ? "size-4" : "size-3.5"} />
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
        className={cn(
          "tabular focus:text-foreground bg-transparent text-center outline-none",
          md ? "w-10 text-sm" : "w-7 text-[11px]",
        )}
      />
      {max != null && (
        <span
          className={cn(
            "tabular text-muted-foreground pr-2",
            md ? "text-sm" : "pr-1.5 text-[11px]",
          )}
        >
          /{max}
        </span>
      )}
      <button
        type="button"
        aria-label="Increase episode progress"
        disabled={pending || !canIncrement}
        onClick={() => commit(progress + 1)}
        className={cn(
          "hover:text-foreground text-muted-foreground grid place-items-center disabled:opacity-40",
          md ? "size-11" : "size-7",
        )}
      >
        <Plus className={md ? "size-4" : "size-3.5"} />
      </button>
    </div>
  );
}

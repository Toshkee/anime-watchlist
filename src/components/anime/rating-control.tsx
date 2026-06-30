"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { updateEntryAction } from "@/lib/actions/watchlist";
import { cn } from "@/lib/utils";

const RATINGS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

/**
 * Your 1–10 score for a title. A star + native select (compact, accessible);
 * the blank option clears the rating. Re-syncs from the `rating` prop during
 * render after a server refresh.
 */
export function RatingControl({
  titleId,
  rating,
  size = "sm",
}: {
  titleId: number;
  rating: number | null;
  size?: "sm" | "md";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [value, setValue] = useState(rating);
  const [synced, setSynced] = useState(rating);
  if (rating !== synced) {
    setSynced(rating);
    setValue(rating);
  }

  function setRating(next: number | null) {
    setValue(next);
    startTransition(async () => {
      try {
        await updateEntryAction({ titleId, rating: next });
        router.refresh();
      } catch {
        toast.error("Couldn't update rating");
      }
    });
  }

  const md = size === "md";

  return (
    <label
      title="Your rating"
      className={cn(
        "border-border bg-secondary flex items-center gap-1 rounded-md border pr-1 pl-1.5",
        md && "h-11 rounded-lg px-2.5",
      )}
    >
      <Star
        className={cn(
          md ? "size-4" : "size-3.5",
          value != null
            ? "fill-amber-300 text-amber-300"
            : "text-muted-foreground",
        )}
      />
      <select
        aria-label="Your rating"
        value={value ?? ""}
        disabled={pending}
        onChange={(e) =>
          setRating(e.target.value === "" ? null : Number(e.target.value))
        }
        className={cn(
          "tabular bg-transparent outline-none",
          md ? "h-11 text-sm" : "h-7 text-[11px]",
        )}
      >
        <option value="">{md ? "Rate" : "–"}</option>
        {RATINGS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}

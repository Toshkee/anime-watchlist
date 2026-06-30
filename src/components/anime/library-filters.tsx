"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WatchStatus } from "@prisma/client";

import {
  WATCH_STATUS_DOT,
  WATCH_STATUS_LABEL,
  WATCH_STATUS_ORDER,
} from "@/lib/watch-status";
import { cn } from "@/lib/utils";

export function LibraryFilters({
  counts,
  total,
}: {
  counts: Partial<Record<WatchStatus, number>>;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const active = searchParams.get("status") ?? "";

  function go(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    const qs = params.toString();
    startTransition(() =>
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }),
    );
  }

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "", label: "All", count: total },
    ...WATCH_STATUS_ORDER.filter((s) => counts[s]).map((s) => ({
      key: s,
      label: WATCH_STATUS_LABEL[s],
      count: counts[s]!,
    })),
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", pending && "opacity-70")}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key || "all"}
            type="button"
            onClick={() => go(tab.key)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.key && (
              <span
                className={cn(
                  "size-2 rounded-full",
                  WATCH_STATUS_DOT[tab.key as WatchStatus],
                )}
              />
            )}
            {tab.label}
            <span className="tabular opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

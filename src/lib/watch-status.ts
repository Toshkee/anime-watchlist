import type { WatchStatus } from "@prisma/client";

export const WATCH_STATUS_LABEL: Record<WatchStatus, string> = {
  WATCHING: "Watching",
  REWATCHING: "Rewatching",
  PLAN_TO_WATCH: "Plan to Watch",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

/** Tailwind background-color class per status (uses the status palette). */
export const WATCH_STATUS_DOT: Record<WatchStatus, string> = {
  WATCHING: "bg-watching",
  REWATCHING: "bg-rewatching",
  PLAN_TO_WATCH: "bg-plan",
  ON_HOLD: "bg-hold",
  COMPLETED: "bg-completed",
  DROPPED: "bg-dropped",
};

/** Display order for grouping / selects. */
export const WATCH_STATUS_ORDER: WatchStatus[] = [
  "WATCHING",
  "REWATCHING",
  "PLAN_TO_WATCH",
  "ON_HOLD",
  "COMPLETED",
  "DROPPED",
];

/** Concrete hex per status — for SVG charts (Recharts) that need real colors. */
export const STATUS_HEX: Record<WatchStatus, string> = {
  WATCHING: "#4fd1c5",
  REWATCHING: "#6e8bf0",
  PLAN_TO_WATCH: "#a8abb5",
  ON_HOLD: "#f5b14c",
  COMPLETED: "#34d399",
  DROPPED: "#f5414f",
};

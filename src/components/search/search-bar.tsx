"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function SearchBar({
  initialQuery = "",
  autoFocus = false,
  placeholder = "Search 500,000+ anime…",
  className,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const skipNext = useRef(true);

  function navigate(q: string) {
    // Preserve any active filters (genre/format/sort/year) when the query changes.
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const qs = params.toString();
    const href = qs ? `/?${qs}` : "/";
    startTransition(() => {
      // On the Browse surface, replace (no history spam); elsewhere, navigate to it.
      if (pathname === "/") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href);
      }
    });
  }

  // Debounce live navigation as the user types.
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const timer = setTimeout(() => navigate(value), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(value);
      }}
      className={cn("relative w-full", className)}
    >
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label="Search anime"
        className="border-border bg-card/80 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 h-12 w-full rounded-full border pr-11 pl-11 text-base shadow-sm backdrop-blur-sm transition-colors outline-none focus-visible:ring-3 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
        {isPending ? (
          <Loader2
            className="text-muted-foreground size-4.5 animate-spin"
            aria-hidden
          />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              navigate("");
            }}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground rounded-full p-0.5 transition-colors"
          >
            <X className="size-4.5" />
          </button>
        ) : null}
      </div>
    </form>
  );
}

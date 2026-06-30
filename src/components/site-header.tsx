import Link from "next/link";
import { LogOut } from "lucide-react";

import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions/auth";
import { ArcMark } from "@/components/arc-logo";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57v-2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.73-1.34-1.73-1.1-.73.08-.72.08-.72 1.21.08 1.85 1.22 1.85 1.22 1.08 1.81 2.83 1.29 3.52.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.86.12 3.16.77.83 1.23 1.88 1.23 3.17 0 4.53-2.8 5.53-5.48 5.82.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z" />
    </svg>
  );
}

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  const nav = [
    { href: "/", label: "Browse" },
    { href: "/calendar", label: "Calendar" },
    ...(user
      ? [
          { href: "/library", label: "Library" },
          { href: "/stats", label: "Stats" },
        ]
      : []),
  ];

  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-2 select-none">
          <span className="bg-primary/15 text-primary ring-primary/25 grid size-8 place-items-center rounded-lg ring-1">
            <ArcMark className="size-5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Arc
          </span>
        </div>

        <MainNav items={nav} />

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="https://github.com/Toshkee/anime-watchlist"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-9 place-items-center rounded-md transition-colors"
          >
            <GitHubMark className="size-4.5" />
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="bg-primary/15 text-primary hidden size-8 place-items-center rounded-full text-sm font-semibold sm:grid">
                  {(user.name ?? "?").charAt(0).toUpperCase()}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants(), "h-9 px-4")}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <MobileNav items={nav} user={user ? { name: user.name } : null} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-border/60 text-muted-foreground mt-20 border-t py-8 text-center text-sm",
        className,
      )}
    >
      <p>
        Data from{" "}
        <a
          href="https://anilist.co"
          target="_blank"
          rel="noreferrer"
          className="text-foreground/80 hover:text-foreground underline-offset-4 hover:underline"
        >
          AniList
        </a>
        . Built with Next.js · A portfolio rebuild by Pavle Tosic.
      </p>
    </footer>
  );
}

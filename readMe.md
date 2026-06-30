# 🎬 Arc — a modern anime tracker

[![CI](https://github.com/Toshkee/anime-watchlist/actions/workflows/ci.yml/badge.svg)](https://github.com/Toshkee/anime-watchlist/actions/workflows/ci.yml)
[![E2E](https://github.com/Toshkee/anime-watchlist/actions/workflows/e2e.yml/badge.svg)](https://github.com/Toshkee/anime-watchlist/actions/workflows/e2e.yml)

> Search 500,000+ anime, build your watchlist, track episode progress, rate what you watch, and turn your taste into stats.

Arc is a full rebuild of an earlier General Assembly bootcamp project. The original was a server-rendered **Express + EJS + MongoDB** CRUD app with a hardcoded catalog. This version is a typed, tested, API-driven product built on a modern stack — kept as a **before/after engineering case study**.

**Live demo:** _coming soon (Vercel)_ · **Original (v1):** preserved on the [`legacy-express`](https://github.com/Toshkee/anime-watchlist/tree/legacy-express) branch.

---

## ✨ Why this rebuild

|              | v1 (bootcamp)                                               | v2 (this repo)                                        |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------- |
| Stack        | Express 5 + EJS + MongoDB                                   | Next.js 16 (App Router) + TypeScript + Tailwind v4    |
| Catalog      | 20 hardcoded titles in `data.js`                            | Live **AniList GraphQL** API (500k+ titles)           |
| Data layer   | Overloaded boolean flags; watchlist copied whole documents  | Prisma + PostgreSQL, referenced by AniList id         |
| Auth         | Hand-rolled `express-session` (in-memory, breaks on Heroku) | Auth.js — credentials + OAuth, HTTP-only cookies      |
| UI           | Animated rainbow gradient, scattered GIFs, Arial            | "Midnight Cinema" design system, poster-forward, dark |
| Quality      | No tests, `"test": exit 1`                                  | Vitest + Playwright + GitHub Actions CI               |
| Known issues | IDOR, stored XSS, DB wiped on every dashboard load          | Audited and fixed in the rebuild                      |

---

## 🚀 Features

- 🔎 **Browse** — one surface that pairs curated rows (trending, popular this season, top of all time) with live AniList search and URL-driven filters (genre, format, year, sort); streamed via React Suspense, shareable, and back-button correct
- 🎞️ **Cinematic detail pages** — full-bleed banner with a per-title **extracted-color hero**, synopsis, tags, studios, score, and next-episode countdown
- 🔐 **Auth.js sign-in** — credentials (bcrypt) + optional OAuth, JWT sessions, route protection via proxy/middleware
- ✅ **Watchlist** with a status workflow (Watching / Completed / Plan / On Hold / Dropped / Rewatching), episode progress, and ratings — with **optimistic UI**
- 📊 **Personal stats dashboard** — episodes & hours watched, completion rate, score distribution, and genre breakdown (Recharts)
- 📅 **Airing calendar** — the next 7 days of episodes with live countdowns
- 🌑 **Midnight Cinema design system** — graphite dark theme, one signature accent, poster-forward 2:3 grid, motion that respects `prefers-reduced-motion`
- 🖼️ Image optimization via `next/image`, server-side AniList proxy with rate-limit-aware caching

**On the roadmap**

- 🌐 Live Vercel demo (Neon Postgres)
- 🗂️ Jikan/MyAnimeList fallback provider

---

## 🧱 Tech stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (Base UI), lucide icons
- **Data:** AniList GraphQL API, Prisma + PostgreSQL
- **Auth:** Auth.js (next-auth v5) — credentials + OAuth, bcrypt password hashing
- **Charts:** Recharts
- **Testing:** Vitest + Testing Library (unit/integration), Playwright (E2E)
- **CI:** GitHub Actions — lint, typecheck, format, unit tests, and a Playwright happy-path against a Postgres service
- **Tooling:** ESLint, Prettier (+ Tailwind class sorting)

## 🏗️ Architecture

```
src/
  app/                 # routes (App Router)
    page.tsx           #   browse — curated rows + live search
    search/            #   legacy route → redirects to /
    anime/[id]/        #   cinematic detail page
    library/           #   per-user watchlist (auth-guarded)
    stats/             #   stats dashboard (auth-guarded)
    calendar/          #   airing schedule
    login/ register/   #   auth screens
    api/auth/          #   Auth.js route handlers
  components/
    anime/             # poster card/grid, track + entry controls
    search/            # search bar + filter bar (client)
    stats/             # Recharts visualizations (client)
    auth/              # auth form
    ui/                # shadcn primitives
  lib/
    anilist/           # typed API layer (client/queries/types/normalize/index)
    actions/           # server actions (auth, watchlist)
    auth.ts            # Auth.js config (Node) + auth.config.ts (edge-safe)
    prisma.ts          # Prisma singleton
    watchlist.ts       # watchlist data access + TTL title cache
    validation.ts      # zod schemas
    format.ts          # presentation helpers
  proxy.ts             # route protection (Next 16 middleware)
prisma/
  schema.prisma        # User / WatchlistEntry / Title + Auth.js models
```

The browser never talks to AniList directly — all calls go through the server, where responses are normalized into one shape and cached (Next.js Data Cache + a Postgres TTL cache for tracked titles). Watchlist mutations are owner-scoped server actions, closing the v1 IDOR where any user could edit any row.

## 🛠️ Getting started

Requires Node 20+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env          # set DATABASE_URL + AUTH_SECRET
npx auth secret               # generates AUTH_SECRET (or: openssl rand -base64 32)
npx prisma migrate dev        # create the schema in your database
npm run dev                   # http://localhost:3000
```

Search and browsing work with no account; the watchlist and stats need a signed-in user.

**Scripts:** `dev` · `build` · `start` · `lint` · `typecheck` · `format` · `test` · `test:e2e`

```bash
npm test          # Vitest unit/integration suite
npm run test:e2e  # Playwright happy path (auto-starts the app)
```

## ☁️ Deploy

Pre-wired for **Vercel + Neon Postgres** — see **[DEPLOY.md](./DEPLOY.md)**. `vercel.json`
runs `prisma migrate deploy` on each deploy and a `postinstall` hook generates the Prisma
client, so going live is just setting env vars and clicking **Deploy**.

---

## 🙋 Credits

Built by **Pavle Tosic** · [GitHub](https://github.com/Toshkee). Anime data courtesy of [AniList](https://anilist.co).

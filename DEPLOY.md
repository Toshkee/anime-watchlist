# Deploying Arc to Vercel

A ~10-minute checklist. You need a [Neon](https://neon.tech) account (free Postgres)
and a [Vercel](https://vercel.com) account. Everything in the repo is already wired
for it — `vercel.json` runs migrations on each deploy and `postinstall` generates the
Prisma client.

## 1. Create the database (Neon)

1. Create a new Neon project. Pick a region close to your Vercel region.
2. Open **Connection Details** and copy **two** strings:
   - **Pooled** connection (the host contains `-pooler`) → this is `DATABASE_URL`.
   - **Direct** connection (host without `-pooler`) → this is `DIRECT_URL`.
     Both should end with `?sslmode=require`.

The app queries through the pooled URL (safe for serverless), and migrations run
over the direct URL (PgBouncer can't execute migration statements).

## 2. Import the repo into Vercel

1. **Add New → Project**, import `Toshkee/anime-watchlist`, branch `main`
   (or `rebuild/nextjs` until it's merged).
2. Framework preset: **Next.js** (auto-detected). Leave build/output settings as-is —
   `vercel.json` already sets the build command to `prisma migrate deploy && next build`.

## 3. Set environment variables

In **Project → Settings → Environment Variables**, add these for **Production**
(and Preview if you want PR deploys):

| Name                  | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`        | Neon **pooled** connection string                          |
| `DIRECT_URL`          | Neon **direct** connection string                          |
| `AUTH_SECRET`         | output of `npx auth secret` (or `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID`      | _(optional)_ Google OAuth client id                        |
| `AUTH_GOOGLE_SECRET`  | _(optional)_ Google OAuth client secret                    |
| `AUTH_DISCORD_ID`     | _(optional)_ Discord OAuth client id                       |
| `AUTH_DISCORD_SECRET` | _(optional)_ Discord OAuth client secret                   |

Credentials sign-in works with no OAuth vars. Auth.js auto-detects the deployment
URL on Vercel (`trustHost: true` is set), so no `AUTH_URL` is needed.

## 4. Deploy

Click **Deploy**. The build runs `prisma migrate deploy` (creating the schema in Neon
on the first deploy) and then `next build`. Done — visit the URL and create an account.

## 5. (Optional) OAuth providers

If you set OAuth vars, register the callback URL in each provider's console:

```
https://<your-domain>/api/auth/callback/google
https://<your-domain>/api/auth/callback/discord
```

## 6. (Optional) Seed demo data

To show a populated library/stats dashboard on the live demo, point the seed script
at the production DB from your machine (uses `DATABASE_URL` from your shell):

```bash
DATABASE_URL="<neon-pooled-url>" node scripts/smoke.mjs
```

Creates a `tester / password123` account with a varied watchlist.

---

### Notes & troubleshooting

- **Migrations run at build time.** If a deploy fails on `prisma migrate deploy`,
  it's almost always a bad `DIRECT_URL`. Check it's the non-pooled host.
- **Connection limits.** The pooled URL handles serverless fan-out. If you ever see
  "too many connections," confirm `DATABASE_URL` is the `-pooler` host.
- **Prefer not to migrate on deploy?** Remove `prisma migrate deploy &&` from
  `vercel.json`'s `buildCommand` and run `npx prisma migrate deploy` manually against
  `DIRECT_URL` instead.

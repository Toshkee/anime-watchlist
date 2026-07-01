// Smoke seed: a test user with a varied watchlist so /library and /stats
// have real data to render. Verifies the auth/session/DB loop end to end.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const username = "tester";
const password = "password123";

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
  where: { username },
  update: { passwordHash },
  create: { username, name: username, passwordHash },
});

const seed = [
  {
    id: 21,
    title: "ONE PIECE",
    dur: 24,
    eps: null,
    score: 87,
    genres: ["Action", "Adventure", "Fantasy"],
    status: "WATCHING",
    progress: 1050,
    rating: 9,
  },
  {
    id: 1535,
    title: "Death Note",
    dur: 23,
    eps: 37,
    score: 84,
    genres: ["Mystery", "Psychological", "Thriller"],
    status: "COMPLETED",
    progress: 37,
    rating: 9,
  },
  {
    id: 16498,
    title: "Attack on Titan",
    dur: 24,
    eps: 25,
    score: 84,
    genres: ["Action", "Drama", "Fantasy"],
    status: "COMPLETED",
    progress: 25,
    rating: 10,
  },
  {
    id: 11061,
    title: "HUNTER×HUNTER (2011)",
    dur: 23,
    eps: 148,
    score: 89,
    genres: ["Action", "Adventure", "Fantasy"],
    status: "WATCHING",
    progress: 60,
    rating: 10,
  },
  {
    id: 101922,
    title: "Demon Slayer",
    dur: 24,
    eps: 26,
    score: 83,
    genres: ["Action", "Supernatural"],
    status: "COMPLETED",
    progress: 26,
    rating: 8,
  },
  {
    id: 113415,
    title: "JUJUTSU KAISEN",
    dur: 24,
    eps: 24,
    score: 86,
    genres: ["Action", "Supernatural"],
    status: "PLAN_TO_WATCH",
    progress: 0,
    rating: null,
  },
  {
    id: 9253,
    title: "Steins;Gate",
    dur: 24,
    eps: 24,
    score: 91,
    genres: ["Sci-Fi", "Thriller", "Drama"],
    status: "COMPLETED",
    progress: 24,
    rating: 10,
  },
  {
    id: 154587,
    title: "Frieren",
    dur: 24,
    eps: 28,
    score: 92,
    genres: ["Adventure", "Drama", "Fantasy"],
    status: "REWATCHING",
    progress: 12,
    rating: 9,
  },
];

// Pull real cover art, banners, and accent colors from AniList so the seeded
// library and detail pages render like the live app instead of blank posters.
const artById = new Map();
{
  const query = `
    query ($ids: [Int]) {
      Page(perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          id
          seasonYear
          coverImage { extraLarge large color }
          bannerImage
        }
      }
    }`;
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: { ids: seed.map((s) => s.id) } }),
  });
  if (!res.ok) throw new Error(`AniList request failed: ${res.status}`);
  const { data } = await res.json();
  for (const m of data.Page.media) {
    artById.set(m.id, {
      // Mirror the app's normalize step: prefer extraLarge, fall back to large.
      coverImage: m.coverImage?.extraLarge ?? m.coverImage?.large ?? null,
      coverColor: m.coverImage?.color ?? null,
      bannerImage: m.bannerImage ?? null,
      seasonYear: m.seasonYear ?? null,
    });
  }
}
const missingArt = seed.filter((s) => !artById.has(s.id)).map((s) => s.id);
if (missingArt.length) console.warn("no AniList art for ids:", missingArt.join(", "));

for (const s of seed) {
  const art = artById.get(s.id) ?? {};
  const titleData = {
    title: s.title,
    duration: s.dur,
    episodes: s.eps,
    averageScore: s.score,
    genres: s.genres,
    format: "TV",
    coverImage: art.coverImage ?? null,
    coverColor: art.coverColor ?? null,
    bannerImage: art.bannerImage ?? null,
    seasonYear: art.seasonYear ?? null,
  };
  await prisma.title.upsert({
    where: { id: s.id },
    update: titleData,
    create: { id: s.id, ...titleData },
  });
  await prisma.watchlistEntry.upsert({
    where: { userId_titleId: { userId: user.id, titleId: s.id } },
    update: { status: s.status, progress: s.progress, rating: s.rating },
    create: {
      userId: user.id,
      titleId: s.id,
      status: s.status,
      progress: s.progress,
      rating: s.rating,
    },
  });
}

const count = await prisma.watchlistEntry.count({ where: { userId: user.id } });
console.log(`seeded user=${user.username} id=${user.id} entries=${count}`);

await prisma.$disconnect();

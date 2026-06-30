import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // AniList cover art + banners
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "img.anili.st" },
      // MyAnimeList CDN (Jikan fallback)
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      // The Movie Database (optional artwork layer)
      { protocol: "https", hostname: "image.tmdb.org" },
    ],
  },
};

export default nextConfig;

import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config. Contains NO Node-only code (no Prisma, no bcrypt),
 * so it can run in middleware. The Credentials provider + adapter are added in
 * `auth.ts`, which runs only in the Node runtime.
 */
const PROTECTED_PREFIXES = ["/library", "/stats", "/me"];

export const authConfig = {
  // Vercel auto-trusts its host; this covers self-hosting / `next start` too.
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some((p) =>
        nextUrl.pathname.startsWith(p),
      );
      if (isProtected && !isLoggedIn) return false; // → redirect to signIn
      return true;
    },
    session({ session, token }) {
      // Auth.js stores the user id in `token.sub` by default.
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

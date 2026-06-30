import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Next.js 16 renamed the "middleware" convention to "proxy".
// Edge-safe auth instance (no Prisma/bcrypt) used only to guard routes;
// the `authorized` callback in authConfig redirects guests to /login.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/library/:path*", "/stats/:path*", "/me/:path*"],
};

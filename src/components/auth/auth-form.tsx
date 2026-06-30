"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Clapperboard, Loader2 } from "lucide-react";

import { authenticate, registerUser, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const action = isLogin ? authenticate : registerUser;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <div className="border-border bg-card/60 rounded-2xl border p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <span className="bg-primary/15 text-primary ring-primary/25 grid size-11 place-items-center rounded-xl ring-1">
            <Clapperboard className="size-5.5" />
          </span>
          <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLogin
              ? "Sign in to track what you watch."
              : "Start building your watchlist in seconds."}
          </p>
        </div>

        <form action={formAction} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              required
              placeholder="straw_hat_luffy"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              placeholder={isLogin ? "••••••••" : "At least 8 characters"}
            />
          </div>

          {state?.error && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
            >
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="h-11 w-full">
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isLogin ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

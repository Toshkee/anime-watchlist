"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/validation";

export type AuthState = { error?: string } | undefined;

export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please check your username and password." };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: "/library",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid username or password." };
    }
    throw error; // re-throw the redirect
  }
  return undefined;
}

export async function registerUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { username, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "That username is already taken." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { username, name: username, passwordHash },
  });

  try {
    await signIn("credentials", { username, password, redirectTo: "/library" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }
  return undefined;
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

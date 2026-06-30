import { z } from "zod";

export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export const watchStatusValues = [
  "WATCHING",
  "COMPLETED",
  "PLAN_TO_WATCH",
  "ON_HOLD",
  "DROPPED",
  "REWATCHING",
] as const;

export const watchlistUpdateSchema = z.object({
  titleId: z.coerce.number().int().positive(),
  status: z.enum(watchStatusValues).optional(),
  progress: z.coerce.number().int().min(0).max(100000).optional(),
  rating: z.coerce.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(2000).optional(),
});

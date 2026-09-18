import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128);

export const emailSchema = z.string().email();

export const displayNameSchema = z.string().trim().min(1).max(80);

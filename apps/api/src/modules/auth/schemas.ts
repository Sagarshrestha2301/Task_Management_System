import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(12).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(12).max(128),
});

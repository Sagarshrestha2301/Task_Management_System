import { z } from "zod";
export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional(),
});
export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(2000).optional(),
});
export const projectParamsSchema = z.object({
  projectId: z.string().uuid(),
});
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "MEMBER"]).optional().default("MEMBER"),
});
export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "MEMBER"]),
});

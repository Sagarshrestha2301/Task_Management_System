import { z } from "zod";
export const projectMemberRoleSchema = z.enum(["OWNER", "MEMBER"]);
export const inviteMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(["OWNER", "MEMBER"]).optional().default("MEMBER"),
});

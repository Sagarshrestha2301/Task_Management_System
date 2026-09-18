import { z } from "zod";
export const sendInvitationSchema = z.object({
    email: z.string().email(),
    role: z.enum(["OWNER", "MEMBER"]).optional().default("MEMBER"),
});
export const acceptInvitationSchema = z.object({
    token: z.string().min(1),
});

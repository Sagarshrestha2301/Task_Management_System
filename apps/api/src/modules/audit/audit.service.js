import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
export async function logAudit(entry) {
    await prisma.auditLog.create({
        data: {
            action: entry.action,
            resourceType: entry.resourceType,
            resourceId: entry.resourceId,
            projectId: entry.projectId,
            actorId: entry.actorId,
            metadataJson: entry.metadata ?? Prisma.JsonNull,
        },
    });
}

import { prisma } from "../../lib/prisma.js";

export async function logAudit(entry: {
  action: string;
  resourceType: string;
  resourceId?: string;
  projectId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      projectId: entry.projectId,
      actorId: entry.actorId,
      metadataJson: entry.metadata ?? {},
    },
  });
}

import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { logAudit } from "../audit/audit.service.js";
import type { Prisma } from "@prisma/client";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(mimeType: string, size: number): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("INVALID_FILE_TYPE");
  }
  if (size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }
}

function generateStorageKey(): string {
  return `${randomBytes(16).toString("hex")}-${Date.now()}`;
}

export async function createAttachment(input: {
  issueId: string;
  uploadedById: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  byteSize: number;
}) {
  return prisma.$transaction(async (tx) => {
    const attachment = await tx.attachment.create({
      data: {
        issueId: input.issueId,
        uploadedById: input.uploadedById,
        originalName: input.originalName,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        byteSize: BigInt(input.byteSize),
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    await logAudit({
      action: "ATTACHMENT_UPLOADED",
      resourceType: "Attachment",
      resourceId: attachment.id,
      projectId: (
        await tx.issue.findUnique({
          where: { id: input.issueId },
          select: { projectId: true },
        })
      )?.projectId,
      actorId: input.uploadedById,
      metadata: {
        originalName: input.originalName,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
      },
    });

    return attachment;
  });
}

export async function getAttachments(input: {
  issueId: string;
  userId: string;
}) {
  const issue = await prisma.issue.findFirst({
    where: {
      id: input.issueId,
      deletedAt: null,
      project: { members: { some: { userId: input.userId } } },
    },
  });
  if (!issue) throw new Error("NOT_FOUND");

  return prisma.attachment.findMany({
    where: { issueId: input.issueId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAttachmentById(attachmentId: string, userId: string) {
  return prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      deletedAt: null,
      issue: { project: { members: { some: { userId } } } },
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      issue: { select: { projectId: true } },
    },
  });
}

export async function deleteAttachment(attachmentId: string, userId: string) {
  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, deletedAt: null, uploadedById: userId },
    include: { issue: { select: { projectId: true } } },
  });
  if (!attachment) throw new Error("NOT_FOUND");

  await prisma.attachment.update({
    where: { id: attachmentId },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: "ATTACHMENT_DELETED",
    resourceType: "Attachment",
    resourceId: attachmentId,
    projectId: attachment.issue.projectId,
    actorId: userId,
    metadata: { originalName: attachment.originalName },
  });
}

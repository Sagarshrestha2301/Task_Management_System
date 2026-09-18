import { prisma } from "../../lib/prisma.js";
import { logAudit } from "../audit/audit.service.js";
export async function createComment(input) {
  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        issueId: input.issueId,
        authorId: input.authorId,
        body: input.body,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
    await logAudit({
      action: "COMMENT_CREATED",
      resourceType: "Comment",
      resourceId: comment.id,
      projectId: (
        await tx.issue.findUnique({
          where: { id: input.issueId },
          select: { projectId: true },
        })
      )?.projectId,
      actorId: input.authorId,
      metadata: { issueId: input.issueId },
    });
    return comment;
  });
}
export async function getComments(input) {
  const where = {
    issueId: input.issueId,
    deletedAt: null,
    issue: { project: { members: { some: { userId: input.userId } } } },
  };
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);
  return {
    comments,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.ceil(total / input.limit),
  };
}
export async function getCommentById(commentId, userId) {
  return prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
      issue: { project: { members: { some: { userId } } } },
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
}
export async function updateComment(commentId, authorId, body) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, authorId, deletedAt: null },
  });
  if (!comment) throw new Error("NOT_FOUND");
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { body },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
  await logAudit({
    action: "COMMENT_UPDATED",
    resourceType: "Comment",
    resourceId: commentId,
    projectId: (
      await prisma.issue.findUnique({
        where: { id: comment.issueId },
        select: { projectId: true },
      })
    )?.projectId,
    actorId: authorId,
  });
  return updated;
}
export async function deleteComment(commentId, authorId) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, authorId, deletedAt: null },
  });
  if (!comment) throw new Error("NOT_FOUND");
  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
  await logAudit({
    action: "COMMENT_DELETED",
    resourceType: "Comment",
    resourceId: commentId,
    projectId: (
      await prisma.issue.findUnique({
        where: { id: comment.issueId },
        select: { projectId: true },
      })
    )?.projectId,
    actorId: authorId,
  });
}

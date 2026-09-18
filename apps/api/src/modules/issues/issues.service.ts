import { prisma } from "../../lib/prisma.js";
import { logAudit } from "../audit/audit.service.js";
import type { Prisma } from "@prisma/client";

export async function getNextIssueNumber(projectId: string): Promise<number> {
  const lastIssue = await prisma.issue.findFirst({
    where: { projectId },
    orderBy: { issueNumber: "desc" },
    select: { issueNumber: true },
  });
  return (lastIssue?.issueNumber ?? 0) + 1;
}

export async function createIssue(input: {
  projectId: string;
  creatorId: string;
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string | null;
  dueDate?: Date | null;
  labelIds?: string[];
}) {
  return prisma.$transaction(async (tx) => {
    const issueNumber = await getNextIssueNumber(input.projectId);

    const maxPosition = await tx.issue.aggregate({
      where: { projectId: input.projectId, status: input.status ?? "TODO" },
      _max: { position: true },
    });

    const issue = await tx.issue.create({
      data: {
        projectId: input.projectId,
        issueNumber,
        createdById: input.creatorId,
        title: input.title,
        description: input.description,
        status: input.status ?? "TODO",
        priority: input.priority ?? "MEDIUM",
        assigneeId: input.assigneeId ?? null,
        dueDate: input.dueDate ?? null,
        position: (maxPosition._max.position ?? -1) + 1,
        version: 1,
        labels: input.labelIds?.length
          ? { create: input.labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        labels: { include: { label: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await logAudit({
      action: "ISSUE_CREATED",
      resourceType: "Issue",
      resourceId: issue.id,
      projectId: input.projectId,
      actorId: input.creatorId,
      metadata: { title: issue.title, issueNumber },
    });

    return issue;
  });
}

export async function getIssues(input: {
  projectId: string;
  userId: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  labelId?: string;
  due?: "overdue" | "today" | "upcoming" | "none";
  sort?: "updatedAt" | "dueDate" | "priority" | "createdAt" | "title";
  order?: "asc" | "desc";
}) {
  const {
    projectId,
    userId,
    page,
    limit,
    search,
    status,
    priority,
    assigneeId,
    labelId,
    due,
    sort = "updatedAt",
    order = "desc",
  } = input;

  const where: Prisma.IssueWhereInput = {
    projectId,
    deletedAt: null,
    project: { members: { some: { userId } } },
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { issueNumber: { equals: parseInt(search) || undefined } },
    ];
  }

  if (status)
    where.status = status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  if (priority)
    where.priority = priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  if (assigneeId) where.assigneeId = assigneeId;
  if (labelId) where.labels = { some: { labelId } };

  const now = new Date();
  if (due === "overdue") where.dueDate = { lt: now, not: null };
  else if (due === "today")
    where.dueDate = {
      gte: new Date(now.setHours(0, 0, 0, 0)),
      lt: new Date(now.setHours(23, 59, 59, 999)),
    };
  else if (due === "upcoming") where.dueDate = { gt: now };
  else if (due === "none") where.dueDate = null;

  const orderBy: Prisma.IssueOrderByWithRelationInput = {};
  if (sort === "dueDate") orderBy.dueDate = order;
  else if (sort === "priority") orderBy.priority = order;
  else if (sort === "createdAt") orderBy.createdAt = order;
  else if (sort === "title") orderBy.title = order;
  else orderBy.updatedAt = order;

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        labels: { include: { label: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    prisma.issue.count({ where }),
  ]);

  return { issues, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getIssueById(
  projectId: string,
  issueId: string,
  userId: string,
) {
  return prisma.issue.findFirst({
    where: {
      id: issueId,
      projectId,
      deletedAt: null,
      project: { members: { some: { userId } } },
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      labels: { include: { label: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      attachments: {
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function updateIssue(input: {
  projectId: string;
  issueId: string;
  actorId: string;
  data: {
    title?: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId?: string | null;
    dueDate?: Date | null;
    version?: number;
  };
}) {
  const { projectId, issueId, actorId, data } = input;

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, projectId, deletedAt: null },
    select: { version: true, status: true, assigneeId: true, position: true },
  });

  if (!issue) throw new Error("NOT_FOUND");

  if (data.version !== undefined && data.version !== issue.version) {
    throw new Error("VERSION_CONFLICT");
  }

  if (data.assigneeId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    if (!member) throw new Error("ASSIGNEE_NOT_MEMBER");
  }

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
      version: { increment: 1 },
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      labels: { include: { label: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  await logAudit({
    action: "ISSUE_UPDATED",
    resourceType: "Issue",
    resourceId: issueId,
    projectId,
    actorId,
    metadata: {
      updatedFields: Object.keys(data).filter((k) => k !== "version"),
    },
  });

  return updated;
}

export async function deleteIssue(
  projectId: string,
  issueId: string,
  actorId: string,
) {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, projectId, deletedAt: null },
  });
  if (!issue) throw new Error("NOT_FOUND");

  await prisma.issue.update({
    where: { id: issueId },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: "ISSUE_DELETED",
    resourceType: "Issue",
    resourceId: issueId,
    projectId,
    actorId,
    metadata: { title: issue.title },
  });
}

export async function addLabels(
  projectId: string,
  issueId: string,
  actorId: string,
  labelIds: string[],
) {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, projectId, deletedAt: null },
  });
  if (!issue) throw new Error("NOT_FOUND");

  const labels = await prisma.label.findMany({
    where: { id: { in: labelIds }, projectId },
  });
  if (labels.length !== labelIds.length) throw new Error("INVALID_LABELS");

  await prisma.issueLabel.createMany({
    data: labelIds.map((labelId) => ({ issueId, labelId })),
    skipDuplicates: true,
  });

  await logAudit({
    action: "LABELS_ADDED",
    resourceType: "Issue",
    resourceId: issueId,
    projectId,
    actorId,
    metadata: { labelIds },
  });

  return prisma.issue.findUnique({
    where: { id: issueId },
    include: { labels: { include: { label: true } } },
  });
}

export async function removeLabel(
  projectId: string,
  issueId: string,
  actorId: string,
  labelId: string,
) {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, projectId, deletedAt: null },
  });
  if (!issue) throw new Error("NOT_FOUND");

  await prisma.issueLabel.deleteMany({
    where: { issueId, labelId },
  });

  await logAudit({
    action: "LABEL_REMOVED",
    resourceType: "Issue",
    resourceId: issueId,
    projectId,
    actorId,
    metadata: { labelId },
  });

  return prisma.issue.findUnique({
    where: { id: issueId },
    include: { labels: { include: { label: true } } },
  });
}

export async function moveIssue(input: {
  projectId: string;
  issueId: string;
  actorId: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  position: number;
  version: number;
}) {
  const { projectId, issueId, actorId, status, position, version } = input;

  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findFirst({
      where: { id: issueId, projectId, deletedAt: null },
      select: { version: true, status: true, position: true },
    });
    if (!issue) throw new Error("NOT_FOUND");
    if (issue.version !== version) throw new Error("VERSION_CONFLICT");

    if (issue.status !== status) {
      await tx.issue.updateMany({
        where: {
          projectId,
          status,
          position: { gte: position },
          deletedAt: null,
        },
        data: { position: { increment: 1 } },
      });
    } else if (position > issue.position) {
      await tx.issue.updateMany({
        where: {
          projectId,
          status,
          position: { gt: issue.position, lte: position },
          deletedAt: null,
        },
        data: { position: { decrement: 1 } },
      });
    } else if (position < issue.position) {
      await tx.issue.updateMany({
        where: {
          projectId,
          status,
          position: { gte: position, lt: issue.position },
          deletedAt: null,
        },
        data: { position: { increment: 1 } },
      });
    }

    const updated = await tx.issue.update({
      where: { id: issueId },
      data: {
        status,
        position,
        version: { increment: 1 },
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        labels: { include: { label: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await logAudit({
      action: "ISSUE_MOVED",
      resourceType: "Issue",
      resourceId: issueId,
      projectId,
      actorId,
      metadata: { fromStatus: issue.status, toStatus: status, position },
    });

    return updated;
  });
}

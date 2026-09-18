import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { logAudit } from "../audit/audit.service.js";
export async function createProject(input) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId: input.ownerId,
      },
    });
    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: input.ownerId,
        role: "OWNER",
      },
    });
    await logAudit({
      action: "PROJECT_CREATED",
      resourceType: "Project",
      resourceId: project.id,
      projectId: project.id,
      actorId: input.ownerId,
      metadata: { name: project.name },
    });
    return project;
  });
}
export async function getProjectsForUser(userId) {
  return prisma.project.findMany({
    where: {
      members: { some: { userId } },
      archivedAt: null,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { issues: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
export async function getProjectById(projectId, userId) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId } },
      archivedAt: null,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      labels: { orderBy: { createdAt: "asc" } },
      _count: { select: { issues: true, members: true } },
    },
  });
}
export async function getProjectForOwner(projectId, ownerId) {
  return prisma.project.findFirst({
    where: { id: projectId, ownerId, archivedAt: null },
  });
}
export async function updateProject(projectId, userId, input) {
  const project = await getProjectForOwner(projectId, userId);
  if (!project) throw new Error("NOT_FOUND");
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name: input.name, description: input.description },
  });
  await logAudit({
    action: "PROJECT_UPDATED",
    resourceType: "Project",
    resourceId: projectId,
    projectId,
    actorId: userId,
    metadata: { name: updated.name },
  });
  return updated;
}
export async function archiveProject(projectId, userId) {
  const project = await getProjectForOwner(projectId, userId);
  if (!project) throw new Error("NOT_FOUND");
  await prisma.project.update({
    where: { id: projectId },
    data: { archivedAt: new Date() },
  });
  await logAudit({
    action: "PROJECT_ARCHIVED",
    resourceType: "Project",
    resourceId: projectId,
    projectId,
    actorId: userId,
  });
}
export async function deleteProject(projectId, userId) {
  const project = await getProjectForOwner(projectId, userId);
  if (!project) throw new Error("NOT_FOUND");
  await prisma.$transaction(async (tx) => {
    await tx.issueLabel.deleteMany({ where: { label: { projectId } } });
    await tx.label.deleteMany({ where: { projectId } });
    await tx.attachment.deleteMany({ where: { issue: { projectId } } });
    await tx.comment.deleteMany({ where: { issue: { projectId } } });
    await tx.issue.deleteMany({ where: { projectId } });
    await tx.projectMember.deleteMany({ where: { projectId } });
    await tx.invitation.deleteMany({ where: { projectId } });
    await tx.auditLog.deleteMany({ where: { projectId } });
    await tx.project.delete({ where: { id: projectId } });
  });
  await logAudit({
    action: "PROJECT_DELETED",
    resourceType: "Project",
    resourceId: projectId,
    projectId,
    actorId: userId,
  });
}
export async function getProjectMembers(projectId, userId) {
  const project = await getProjectById(projectId, userId);
  if (!project) throw new Error("NOT_FOUND");
  return project.members;
}
export async function addProjectMember(projectId, actorId, input) {
  const project = await getProjectForOwner(projectId, actorId);
  if (!project) throw new Error("NOT_FOUND");
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) throw new Error("USER_NOT_FOUND");
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) throw new Error("ALREADY_MEMBER");
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: input.role,
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });
  await logAudit({
    action: "MEMBER_ADDED",
    resourceType: "ProjectMember",
    resourceId: `${projectId}:${user.id}`,
    projectId,
    actorId,
    metadata: { memberId: user.id, role: input.role },
  });
  return member;
}
export async function removeProjectMember(projectId, actorId, targetUserId) {
  const project = await getProjectForOwner(projectId, actorId);
  if (!project) throw new Error("NOT_FOUND");
  if (targetUserId === project.ownerId) throw new Error("CANNOT_REMOVE_OWNER");
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
  await logAudit({
    action: "MEMBER_REMOVED",
    resourceType: "ProjectMember",
    resourceId: `${projectId}:${targetUserId}`,
    projectId,
    actorId,
    metadata: { memberId: targetUserId },
  });
}
export async function updateMemberRole(projectId, actorId, targetUserId, role) {
  const project = await getProjectForOwner(projectId, actorId);
  if (!project) throw new Error("NOT_FOUND");
  if (targetUserId === project.ownerId && role !== "OWNER")
    throw new Error("CANNOT_CHANGE_OWNER_ROLE");
  await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: { role },
  });
  await logAudit({
    action: "MEMBER_ROLE_UPDATED",
    resourceType: "ProjectMember",
    resourceId: `${projectId}:${targetUserId}`,
    projectId,
    actorId,
    metadata: { memberId: targetUserId, role },
  });
}
export async function sendInvitation(projectId, actorId, input) {
  const project = await getProjectForOwner(projectId, actorId);
  if (!project) throw new Error("NOT_FOUND");
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: existingUser.id } },
    });
    if (existingMember) throw new Error("ALREADY_MEMBER");
  }
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      projectId,
      email: input.email.toLowerCase(),
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvitation) throw new Error("INVITATION_EXISTS");
  const secret = randomBytes(32).toString("hex");
  const secretHash = createHash("sha256").update(secret).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  const invitation = await prisma.invitation.create({
    data: {
      projectId,
      email: input.email.toLowerCase(),
      role: input.role,
      secretHash,
      expiresAt,
      createdBy: actorId,
    },
  });
  await logAudit({
    action: "INVITATION_SENT",
    resourceType: "Invitation",
    resourceId: invitation.id,
    projectId,
    actorId,
    metadata: { email: input.email, role: input.role },
  });
  return { invitation, secret };
}
export async function getInvitations(projectId, userId) {
  const project = await getProjectById(projectId, userId);
  if (!project) throw new Error("NOT_FOUND");
  return prisma.invitation.findMany({
    where: { projectId },
    include: { creator: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}
export async function acceptInvitation(token, userId) {
  const secretHash = createHash("sha256").update(token).digest("hex");
  const invitation = await prisma.invitation.findUnique({
    where: { secretHash },
    include: { project: true },
  });
  if (!invitation) throw new Error("INVALID_INVITATION");
  if (invitation.acceptedAt) throw new Error("ALREADY_ACCEPTED");
  if (invitation.expiresAt < new Date()) throw new Error("EXPIRED");
  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: invitation.projectId, userId } },
  });
  if (existingMember) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
    throw new Error("ALREADY_MEMBER");
  }
  await prisma.$transaction([
    prisma.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);
  await logAudit({
    action: "INVITATION_ACCEPTED",
    resourceType: "Invitation",
    resourceId: invitation.id,
    projectId: invitation.projectId,
    actorId: userId,
  });
  return invitation.projectId;
}
export async function revokeInvitation(projectId, actorId, invitationId) {
  const project = await getProjectForOwner(projectId, actorId);
  if (!project) throw new Error("NOT_FOUND");
  await prisma.invitation.delete({ where: { id: invitationId } });
  await logAudit({
    action: "INVITATION_REVOKED",
    resourceType: "Invitation",
    resourceId: invitationId,
    projectId,
    actorId,
  });
}

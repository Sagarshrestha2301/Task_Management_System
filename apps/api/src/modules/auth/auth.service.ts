import { randomBytes, createHash } from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { logAudit } from "../audit/audit.service.js";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

function generateSecret(): string {
  return randomBytes(32).toString("hex");
}

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export async function createSession(
  userId: string,
  ip?: string,
  userAgent?: string,
): Promise<{ sessionId: string; secret: string; expiresAt: Date }> {
  const secret = generateSecret();
  const secretHash = hashSecret(secret);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const session = await prisma.session.create({
    data: {
      userId,
      secretHash,
      expiresAt,
      ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
      userAgent: userAgent ?? null,
    },
  });

  return { sessionId: session.id, secret, expiresAt };
}

export async function validateSession(secret: string): Promise<{
  user: { id: string; email: string; name: string };
  sessionId: string;
} | null> {
  const secretHash = hashSecret(secret);

  const session = await prisma.session.findUnique({
    where: { secretHash },
    include: { user: true },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt < new Date()) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    sessionId: session.id,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function createPasswordResetToken(
  userId: string,
): Promise<{ token: string; tokenHash: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, tokenHash, expiresAt };
}

export async function validatePasswordResetToken(
  token: string,
): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken) return null;
  if (resetToken.usedAt) return null;
  if (resetToken.expiresAt < new Date()) return null;

  return { userId: resetToken.userId, tokenId: resetToken.id };
}

export async function consumePasswordResetToken(
  tokenId: string,
): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ user: { id: string; email: string; name: string } }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name.trim(),
      passwordHash,
    },
  });

  await logAudit({
    action: "USER_REGISTERED",
    resourceType: "User",
    resourceId: user.id,
    actorId: user.id,
    metadata: { email: user.email },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}): Promise<{
  user: { id: string; email: string; name: string };
  sessionId: string;
  secret: string;
  expiresAt: Date;
} | null> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    await logAudit({
      action: "LOGIN_FAILED",
      resourceType: "User",
      metadata: { email: input.email, reason: "user_not_found" },
    });
    return null;
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    await logAudit({
      action: "LOGIN_FAILED",
      resourceType: "User",
      resourceId: user.id,
      actorId: user.id,
      metadata: { email: input.email, reason: "invalid_password" },
    });
    return null;
  }

  const session = await createSession(user.id, input.ip, input.userAgent);

  await logAudit({
    action: "LOGIN_SUCCESS",
    resourceType: "User",
    resourceId: user.id,
    actorId: user.id,
    metadata: { email: input.email },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    sessionId: session.sessionId,
    secret: session.secret,
    expiresAt: session.expiresAt,
  };
}

export async function logoutUser(sessionId: string): Promise<void> {
  await revokeSession(sessionId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) throw new Error("INVALID_CURRENT_PASSWORD");

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await logAudit({
    action: "PASSWORD_CHANGED",
    resourceType: "User",
    resourceId: userId,
    actorId: userId,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  await logAudit({
    action: "PASSWORD_RESET_REQUESTED",
    resourceType: "User",
    resourceId: user?.id,
    metadata: { email },
  });

  if (!user) return; // Silent failure for enumeration resistance

  await createPasswordResetToken(user.id);
  // TODO: Send email with token
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const validation = await validatePasswordResetToken(token);
  if (!validation) throw new Error("INVALID_OR_EXPIRED_TOKEN");

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: validation.userId },
      data: { passwordHash },
    });
    await tx.session.updateMany({
      where: { userId: validation.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await tx.passwordResetToken.update({
      where: { id: validation.tokenId },
      data: { usedAt: new Date() },
    });
  });

  await logAudit({
    action: "PASSWORD_RESET_COMPLETED",
    resourceType: "User",
    resourceId: validation.userId,
    actorId: validation.userId,
  });
}

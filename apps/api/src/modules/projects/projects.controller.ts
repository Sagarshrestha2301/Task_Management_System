import { type Request, type Response, type NextFunction } from "express";
import { makeErrorResponse } from "../../lib/errors.js";
import { generateRequestId } from "../../lib/request-id.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectParamsSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "./schemas.js";
import * as projectsService from "./projects.service.js";

function formatZodErrors(
  errors: Record<string, string[]>,
): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const [key, messages] of Object.entries(errors)) {
    formatted[key] = messages.join(", ");
  }
  return formatted;
}

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Project creation failed.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const project = await projectsService.createProject({
      ownerId: user.id,
      name: parseResult.data.name,
      description: parseResult.data.description,
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function listProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const user = (req as any).user;
    const projects = await projectsService.getProjectsForUser(user.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const project = await projectsService.getProjectById(
      parseResult.data.projectId,
      user.id,
    );

    if (!project) {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const bodyResult = updateProjectSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Update failed.",
            requestId,
            formatZodErrors(bodyResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const project = await projectsService.updateProject(
      parseResult.data.projectId,
      user.id,
      bodyResult.data,
    );

    res.json({ project });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }
    next(err);
  }
}

export async function archiveProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    await projectsService.archiveProject(parseResult.data.projectId, user.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }
    next(err);
  }
}

export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    await projectsService.deleteProject(parseResult.data.projectId, user.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }
    next(err);
  }
}

export async function listMembers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const members = await projectsService.getProjectMembers(
      parseResult.data.projectId,
      user.id,
    );
    res.json({ members });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }
    next(err);
  }
}

export async function addMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const bodyResult = inviteMemberSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid request.",
            requestId,
            formatZodErrors(bodyResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const member = await projectsService.addProjectMember(
      parseResult.data.projectId,
      user.id,
      bodyResult.data,
    );
    res.status(201).json({ member });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(
            makeErrorResponse("NOT_FOUND", "Project not found.", requestId),
          );
        return;
      }
      if (err.message === "USER_NOT_FOUND") {
        res.status(404).json(
          makeErrorResponse("NOT_FOUND", "User not found.", requestId, {
            email: "User not found.",
          }),
        );
        return;
      }
      if (err.message === "ALREADY_MEMBER") {
        res
          .status(409)
          .json(
            makeErrorResponse(
              "CONFLICT",
              "User is already a member.",
              requestId,
            ),
          );
        return;
      }
    }
    next(err);
  }
}

export async function removeMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const { userId } = req.body;
    if (!userId || typeof userId !== "string") {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "userId is required.",
            requestId,
            { userId: "userId is required." },
          ),
        );
      return;
    }

    const user = (req as any).user;
    await projectsService.removeProjectMember(
      parseResult.data.projectId,
      user.id,
      userId,
    );
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(
            makeErrorResponse("NOT_FOUND", "Project not found.", requestId),
          );
        return;
      }
      if (err.message === "CANNOT_REMOVE_OWNER") {
        res
          .status(403)
          .json(
            makeErrorResponse(
              "FORBIDDEN",
              "Cannot remove project owner.",
              requestId,
            ),
          );
        return;
      }
    }
    next(err);
  }
}

export async function updateMemberRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const bodyResult = updateMemberRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid request.",
            requestId,
            formatZodErrors(bodyResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const { userId } = req.body;
    if (!userId || typeof userId !== "string") {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "userId is required.",
            requestId,
            { userId: "userId is required." },
          ),
        );
      return;
    }

    const user = (req as any).user;
    await projectsService.updateMemberRole(
      parseResult.data.projectId,
      user.id,
      userId,
      bodyResult.data.role,
    );
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(
            makeErrorResponse("NOT_FOUND", "Project not found.", requestId),
          );
        return;
      }
      if (err.message === "CANNOT_CHANGE_OWNER_ROLE") {
        res
          .status(403)
          .json(
            makeErrorResponse(
              "FORBIDDEN",
              "Cannot change owner role.",
              requestId,
            ),
          );
        return;
      }
    }
    next(err);
  }
}

export async function sendInvitation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const bodyResult = inviteMemberSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid request.",
            requestId,
            formatZodErrors(bodyResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const { invitation, secret } = await projectsService.sendInvitation(
      parseResult.data.projectId,
      user.id,
      bodyResult.data,
    );
    res.status(201).json({ invitation, secret });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(
            makeErrorResponse("NOT_FOUND", "Project not found.", requestId),
          );
        return;
      }
      if (err.message === "ALREADY_MEMBER") {
        res
          .status(409)
          .json(
            makeErrorResponse(
              "CONFLICT",
              "User is already a member.",
              requestId,
            ),
          );
        return;
      }
      if (err.message === "INVITATION_EXISTS") {
        res
          .status(409)
          .json(
            makeErrorResponse(
              "CONFLICT",
              "Pending invitation already exists.",
              requestId,
            ),
          );
        return;
      }
    }
    next(err);
  }
}

export async function listInvitations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const invitations = await projectsService.getInvitations(
      parseResult.data.projectId,
      user.id,
    );
    res.json({ invitations });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }
    next(err);
  }
}

export async function revokeInvitation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = projectParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const { invitationId } = req.body;
    if (!invitationId || typeof invitationId !== "string") {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "invitationId is required.",
            requestId,
            { invitationId: "invitationId is required." },
          ),
        );
      return;
    }

    const user = (req as any).user;
    await projectsService.revokeInvitation(
      parseResult.data.projectId,
      user.id,
      invitationId,
    );
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Project not found.", requestId));
      return;
    }
    next(err);
  }
}

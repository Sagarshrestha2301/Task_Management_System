import { type Request, type Response, type NextFunction } from "express";
import { makeErrorResponse } from "../../lib/errors.js";
import { generateRequestId } from "../../lib/request-id.js";
import {
  createCommentSchema,
  updateCommentSchema,
  commentParamsSchema,
  commentQuerySchema,
} from "./schemas.js";
import * as commentsService from "./comments.service.js";

function formatZodErrors(
  errors: Record<string, string[]>,
): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const [key, messages] of Object.entries(errors)) {
    formatted[key] = messages.join(", ");
  }
  return formatted;
}

export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = commentParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const bodyResult = createCommentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Comment creation failed.",
            requestId,
            formatZodErrors(bodyResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const comment = await commentsService.createComment({
      issueId: parseResult.data.issueId,
      authorId: user.id,
      body: bodyResult.data.body,
    });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function listComments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = commentParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const queryResult = commentQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid query parameters.",
            requestId,
            formatZodErrors(queryResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const result = await commentsService.getComments({
      issueId: parseResult.data.issueId,
      userId: user.id,
      page: queryResult.data.page ?? 1,
      limit: queryResult.data.limit ?? 25,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = commentParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid issue or comment ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    const comment = await commentsService.getCommentById(
      parseResult.data.commentId,
      user.id,
    );

    if (!comment) {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Comment not found.", requestId));
      return;
    }

    res.json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function updateComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = commentParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid issue or comment ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const bodyResult = updateCommentSchema.safeParse(req.body);
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
    const comment = await commentsService.updateComment(
      parseResult.data.commentId,
      user.id,
      bodyResult.data.body,
    );
    res.json({ comment });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Comment not found.", requestId));
      return;
    }
    next(err);
  }
}

export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);

  try {
    const parseResult = commentParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid issue or comment ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }

    const user = (req as any).user;
    await commentsService.deleteComment(parseResult.data.commentId, user.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Comment not found.", requestId));
      return;
    }
    next(err);
  }
}

import { makeErrorResponse } from "../../lib/errors.js";
import { generateRequestId } from "../../lib/request-id.js";
import {
  createIssueSchema,
  updateIssueSchema,
  issueParamsSchema,
  issueQuerySchema,
  addLabelsSchema,
  removeLabelSchema,
  reorderIssueSchema,
} from "./schemas.js";
import * as issuesService from "./issues.service.js";
function formatZodErrors(errors) {
  const formatted = {};
  for (const [key, messages] of Object.entries(errors)) {
    formatted[key] = messages.join(", ");
  }
  return formatted;
}
export async function createIssue(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
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
    const bodyResult = createIssueSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Issue creation failed.",
            requestId,
            formatZodErrors(bodyResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const user = req.user;
    const dueDate = bodyResult.data.dueDate
      ? new Date(bodyResult.data.dueDate)
      : null;
    const issue = await issuesService.createIssue({
      projectId: parseResult.data.projectId,
      creatorId: user.id,
      title: bodyResult.data.title,
      description: bodyResult.data.description,
      status: bodyResult.data.status,
      priority: bodyResult.data.priority,
      assigneeId: bodyResult.data.assigneeId ?? null,
      dueDate,
      labelIds: bodyResult.data.labelIds,
    });
    res.status(201).json({ issue });
  } catch (err) {
    if (err instanceof Error && err.message === "ASSIGNEE_NOT_MEMBER") {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Assignee must be a project member.",
            requestId,
            { assigneeId: "Assignee must be a project member." },
          ),
        );
      return;
    }
    next(err);
  }
}
export async function listIssues(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
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
    const queryResult = issueQuerySchema.safeParse(req.query);
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
    const user = req.user;
    const result = await issuesService.getIssues({
      projectId: parseResult.data.projectId,
      userId: user.id,
      page: queryResult.data.page ?? 1,
      limit: queryResult.data.limit ?? 25,
      search: queryResult.data.search,
      status: queryResult.data.status,
      priority: queryResult.data.priority,
      assigneeId: queryResult.data.assigneeId,
      labelId: queryResult.data.labelId,
      due: queryResult.data.due,
      sort: queryResult.data.sort,
      order: queryResult.data.order,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
export async function getIssue(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project or issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const user = req.user;
    const issue = await issuesService.getIssueById(
      parseResult.data.projectId,
      parseResult.data.issueId,
      user.id,
    );
    if (!issue) {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Issue not found.", requestId));
      return;
    }
    res.json({ issue });
  } catch (err) {
    next(err);
  }
}
export async function updateIssue(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project or issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const bodyResult = updateIssueSchema.safeParse(req.body);
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
    const user = req.user;
    const dueDate = bodyResult.data.dueDate
      ? new Date(bodyResult.data.dueDate)
      : bodyResult.data.dueDate === ""
        ? null
        : undefined;
    const issue = await issuesService.updateIssue({
      projectId: parseResult.data.projectId,
      issueId: parseResult.data.issueId,
      actorId: user.id,
      data: {
        title: bodyResult.data.title,
        description: bodyResult.data.description,
        status: bodyResult.data.status,
        priority: bodyResult.data.priority,
        assigneeId: bodyResult.data.assigneeId ?? undefined,
        dueDate,
        version: bodyResult.data.version,
      },
    });
    res.json({ issue });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(makeErrorResponse("NOT_FOUND", "Issue not found.", requestId));
        return;
      }
      if (err.message === "VERSION_CONFLICT") {
        res
          .status(409)
          .json(
            makeErrorResponse(
              "CONFLICT",
              "Issue was modified by another user. Please refresh and try again.",
              requestId,
            ),
          );
        return;
      }
      if (err.message === "ASSIGNEE_NOT_MEMBER") {
        res
          .status(400)
          .json(
            makeErrorResponse(
              "VALIDATION_ERROR",
              "Assignee must be a project member.",
              requestId,
              { assigneeId: "Assignee must be a project member." },
            ),
          );
        return;
      }
    }
    next(err);
  }
}
export async function deleteIssue(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project or issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const user = req.user;
    await issuesService.deleteIssue(
      parseResult.data.projectId,
      parseResult.data.issueId,
      user.id,
    );
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Issue not found.", requestId));
      return;
    }
    next(err);
  }
}
export async function addLabels(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project or issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const bodyResult = addLabelsSchema.safeParse(req.body);
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
    const user = req.user;
    const issue = await issuesService.addLabels(
      parseResult.data.projectId,
      parseResult.data.issueId,
      user.id,
      bodyResult.data.labelIds,
    );
    res.json({ issue });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(makeErrorResponse("NOT_FOUND", "Issue not found.", requestId));
        return;
      }
      if (err.message === "INVALID_LABELS") {
        res
          .status(400)
          .json(
            makeErrorResponse(
              "VALIDATION_ERROR",
              "One or more labels are invalid.",
              requestId,
              { labelIds: "One or more labels are invalid." },
            ),
          );
        return;
      }
    }
    next(err);
  }
}
export async function removeLabel(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project or issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const bodyResult = removeLabelSchema.safeParse(req.body);
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
    const user = req.user;
    const issue = await issuesService.removeLabel(
      parseResult.data.projectId,
      parseResult.data.issueId,
      user.id,
      bodyResult.data.labelId,
    );
    res.json({ issue });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      res
        .status(404)
        .json(makeErrorResponse("NOT_FOUND", "Issue not found.", requestId));
      return;
    }
    next(err);
  }
}
export async function moveIssue(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const parseResult = issueParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid project or issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const bodyResult = reorderIssueSchema.safeParse(req.body);
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
    const user = req.user;
    const issue = await issuesService.moveIssue({
      projectId: parseResult.data.projectId,
      issueId: parseResult.data.issueId,
      actorId: user.id,
      status: bodyResult.data.status,
      position: bodyResult.data.position,
      version: bodyResult.data.version,
    });
    res.json({ issue });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        res
          .status(404)
          .json(makeErrorResponse("NOT_FOUND", "Issue not found.", requestId));
        return;
      }
      if (err.message === "VERSION_CONFLICT") {
        res
          .status(409)
          .json(
            makeErrorResponse(
              "CONFLICT",
              "Issue was modified by another user. Please refresh and try again.",
              requestId,
            ),
          );
        return;
      }
    }
    next(err);
  }
}

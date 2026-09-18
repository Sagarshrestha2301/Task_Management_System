import { randomBytes } from "node:crypto";
import { makeErrorResponse } from "../../lib/errors.js";
import { generateRequestId } from "../../lib/request-id.js";
import { issueParamsSchema } from "../issues/schemas.js";
import * as attachmentsService from "./attachments.service.js";
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
function formatZodErrors(errors) {
  const formatted = {};
  for (const [key, messages] of Object.entries(errors)) {
    formatted[key] = messages.join(", ");
  }
  return formatted;
}
export async function uploadAttachment(req, res, next) {
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
            "Invalid issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const file = req.file;
    if (!file) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "No file uploaded.",
            requestId,
            { file: "No file uploaded." },
          ),
        );
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "Invalid file type. Allowed: JPEG, PNG, WebP, PDF.",
            requestId,
            { file: "Invalid file type." },
          ),
        );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "File too large. Maximum 10MB.",
            requestId,
            { file: "File too large." },
          ),
        );
      return;
    }
    const user = req.user;
    const storageKey = `${randomBytes(16).toString("hex")}-${Date.now()}`;
    const attachment = await attachmentsService.createAttachment({
      issueId: parseResult.data.issueId,
      uploadedById: user.id,
      originalName: file.originalname,
      storageKey,
      mimeType: file.mimetype,
      byteSize: file.size,
    });
    res.status(201).json({ attachment });
  } catch (err) {
    next(err);
  }
}
export async function listAttachments(req, res, next) {
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
            "Invalid issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const user = req.user;
    const attachments = await attachmentsService.getAttachments({
      issueId: parseResult.data.issueId,
      userId: user.id,
    });
    res.json({ attachments });
  } catch (err) {
    next(err);
  }
}
export async function downloadAttachment(req, res, next) {
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
            "Invalid issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const { attachmentId } = req.query;
    if (!attachmentId || typeof attachmentId !== "string") {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "attachmentId is required.",
            requestId,
            { attachmentId: "attachmentId is required." },
          ),
        );
      return;
    }
    const user = req.user;
    const attachment = await attachmentsService.getAttachmentById(
      attachmentId,
      user.id,
    );
    if (!attachment) {
      res
        .status(404)
        .json(
          makeErrorResponse("NOT_FOUND", "Attachment not found.", requestId),
        );
      return;
    }
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.originalName}"`,
    );
    res.setHeader("Content-Length", attachment.byteSize.toString());
    res.status(200).send();
  } catch (err) {
    next(err);
  }
}
export async function deleteAttachment(req, res, next) {
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
            "Invalid issue ID.",
            requestId,
            formatZodErrors(parseResult.error.flatten().fieldErrors),
          ),
        );
      return;
    }
    const { attachmentId } = req.body;
    if (!attachmentId || typeof attachmentId !== "string") {
      res
        .status(400)
        .json(
          makeErrorResponse(
            "VALIDATION_ERROR",
            "attachmentId is required.",
            requestId,
            { attachmentId: "attachmentId is required." },
          ),
        );
      return;
    }
    const user = req.user;
    await attachmentsService.deleteAttachment(attachmentId, user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

import { Router } from "express";
import multer from "multer";
import {
  uploadAttachment,
  listAttachments,
  downloadAttachment,
  deleteAttachment,
} from "./attachments.controller.js";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.mimetype,
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
export function createAttachmentsRouter() {
  const router = Router();
  router.post("/", upload.single("file"), uploadAttachment);
  router.get("/", listAttachments);
  router.get("/download", downloadAttachment);
  router.delete("/", deleteAttachment);
  return router;
}

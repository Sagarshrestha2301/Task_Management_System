import { makeErrorResponse } from "../../lib/errors.js";
import { generateRequestId } from "../../lib/request-id.js";
import * as authService from "./auth.service.js";
const SESSION_COOKIE_NAME = "session";
function getSessionSecret(req) {
  return req.cookies?.[SESSION_COOKIE_NAME] ?? null;
}
export async function withAuth(req, res, next) {
  const requestId = generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  try {
    const secret = req.cookies?.[SESSION_COOKIE_NAME] ?? null;
    if (!secret) {
      res
        .status(401)
        .json(
          makeErrorResponse(
            "UNAUTHENTICATED",
            "Authentication required.",
            requestId,
          ),
        );
      return;
    }
    const session = await authService.validateSession(secret);
    if (!session) {
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      res
        .status(401)
        .json(
          makeErrorResponse(
            "UNAUTHENTICATED",
            "Session expired or invalid.",
            requestId,
          ),
        );
      return;
    }
    req.user = session.user;
    req.sessionId = session.sessionId;
    next();
  } catch (err) {
    next(err);
  }
}
export function optionalAuth(req, _res, next) {
  const secret = req.cookies?.[SESSION_COOKIE_NAME] ?? null;
  if (!secret) {
    next();
    return;
  }
  authService
    .validateSession(secret)
    .then((session) => {
      if (session) {
        req.user = session.user;
        req.sessionId = session.sessionId;
      }
      next();
    })
    .catch(() => next());
}
